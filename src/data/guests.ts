export interface Guest {
  /**
   * Stable, random, non-guessable identifier -- the ONE true identity for
   * this invitation group. Generated once when the guest is added and
   * never regenerated afterwards (a reload, a slug edit, anything) --
   * doing so would invalidate every link already sent and orphan any
   * RSVP already written under it (see rsvp.ts: the Firestore doc id
   * literally *is* this value). Never derived from displayName/slug, never
   * sequential (no guest1/guest2/incrementing ids -- those are guessable
   * and enumerable). Minimum 12 characters of high-entropy
   * alphanumerics, e.g. generated with crypto.randomUUID().replace(/-/g,
   * '').slice(0, 16) or nanoid(16).
   *
   * This is what actually gates access to a guest's personalized page --
   * see src/pages/i/[invite].astro, which only pre-renders the exact
   * `${slug}-${inviteId}` combination for each guest below. A visitor who
   * guesses/mutates the slug half of a URL but not the inviteId half hits
   * a 404, never another guest's invitation.
   */
  inviteId: string;
  /**
   * URL-safe slug, e.g. `stefania-y-matias`. Lowercase, hyphen-separated,
   * no ampersands. Presentation only -- readable, but never used alone as
   * an identifier or a Firestore document id (see inviteId above). Two
   * guests could theoretically share a slug; they can never share an
   * inviteId.
   */
  slug: string;
  /** Guest name(s) as shown on the invitation. Recommended max 32 characters. */
  displayName: string;
  /**
   * How MemoryScene's dynamic closing line addresses this guest --
   * 'singular' ("Y tú, ahí.") for one person, 'plural' ("Y ustedes, ahí.")
   * for a couple, family or group. This is the single explicit, typed
   * source of truth for that choice -- never derive it by inspecting
   * displayName for "y"/spaces/etc., and never hardcode a slug list
   * anywhere else. Every guest below sets it explicitly.
   */
  addressing: 'singular' | 'plural';
  /**
   * Personalized message. Recommended up to 120 visible characters, hard cap
   * MAX_DEDICATION_LENGTH (160 visible characters -- see getVisibleDedicationLength).
   *
   * Write it plainly, in normal Spanish -- Cover.astro automatically runs
   * it through hyphenateSpanishText() (src/lib/spanishHyphenation.ts) at
   * build time, which inserts soft hyphens (U+00AD) at safe, real syllable
   * boundaries wherever a word needs to break across lines. You do not need
   * to hand-annotate long words yourself.
   *
   * Manual override: if you ever need to force (or forbid) a specific break
   * point, insert U+00AD yourself as the `\u00AD` escape -- a word that
   * already contains one is left completely untouched by the automatic
   * hyphenation. Always write it as `\u00AD`, never as a literal invisible
   * character, so it stays visible/greppable in the source.
   * Example: `'incondicional\u00ADmente'`.
   * The automatic hyphenation already skips proper names, surnames, place
   * names (heuristically: capitalized words not at the start of a
   * sentence), acronyms, and URLs on its own -- you shouldn't normally need
   * the override for those.
   */
  dedication: string;
  /**
   * Expected number of people traveling under this invitation -- used
   * only for the RSVP record saved on page 9 (StayScene.astro). Optional:
   * defaults to 1 for 'singular' guests and 2 for 'plural' ones (see
   * getGuestPartySize) when not set explicitly, so existing entries don't
   * need to be filled in immediately.
   */
  partySize?: number;
}

/**
 * Absolute cap on Guest.dedication, counting spaces and punctuation but not
 * soft hyphens (U+00AD) -- see getVisibleDedicationLength. Cover.astro scales
 * the dedication's font-size/line-height continuously up to this length (see
 * computeDedicationTypography there); nothing past it has been designed for
 * or validated to fit safely above .cover__names.
 */
export const MAX_DEDICATION_LENGTH = 160;

/**
 * Dedication length for every visual/timing purpose (typography ramp,
 * writing-animation duration, this max-length check): soft hyphens are
 * invisible unless the browser actually breaks the word there, so they must
 * never count as visible weight -- otherwise an editor adding one or two for
 * better wrapping would unfairly lose real, visible characters off their cap.
 */
export function getVisibleDedicationLength(dedication: string): number {
  return dedication.replace(/\u00AD/g, '').length;
}

// Test fixtures only, used to validate the slug/inviteId architecture --
// the definitive guest list is not loaded yet. Exactly two, on purpose:
// one plural/couple case and one singular case. Both inviteId values
// below are fixed test codes (not real crypto-random output) so the
// architecture is reproducible while it's being verified; real guests get
// a freshly generated inviteId each, per the field's own doc comment.
export const guests: Guest[] = [
  {
    inviteId: '7Qm2Kp9VxL3a',
    slug: 'stefania-y-matias',
    displayName: 'Stefanía y Matías',
    addressing: 'plural',
    dedication: 'Hay viajes que no tendrían el mismo sentido sin ciertas personas.',
    partySize: 2,
  },
  {
    inviteId: 'Rn8Wc4TbYh2Z',
    slug: 'rodney',
    displayName: 'Rodney',
    addressing: 'singular',
    dedication: 'Gracias por acompañarnos en este nuevo comienzo.',
    partySize: 1,
  },
];

/**
 * The real identity lookup -- resolves a guest by its stable inviteId,
 * never by slug/displayName (see Guest.inviteId's own doc comment for
 * why). This is what src/pages/i/[invite].astro's props are built from.
 */
export function getGuestByInviteId(inviteId: string): Guest | undefined {
  return guests.find((guest) => guest.inviteId === inviteId);
}

/**
 * Builds the `${slug}-${inviteId}` route param used under /i/ (see
 * src/pages/i/[invite].astro). The slug half is presentation only; the
 * inviteId half -- always this function's last 12+ characters, always
 * after the final guest-authored hyphen boundary of the slug -- is what
 * actually resolves the page.
 */
export function getInviteParam(guest: Guest): string {
  return `${guest.slug}-${guest.inviteId}`;
}

/** Resolves Guest.partySize, falling back by addressing when unset. */
export function getGuestPartySize(guest: Guest): number {
  if (typeof guest.partySize === 'number') return guest.partySize;
  return guest.addressing === 'singular' ? 1 : 2;
}

// Runs at module load, i.e. every `astro dev`/`astro build` -- this module
// only ever executes on the server/build side, never in the browser. Fails
// loudly and early, naming the offending guest and the length found, rather
// than letting an over-length dedication reach Cover.astro's height-fit
// fallback silently.
const MIN_INVITE_ID_LENGTH = 12;
const seenInviteIds = new Set<string>();
for (const guest of guests) {
  const visibleLength = getVisibleDedicationLength(guest.dedication);
  if (visibleLength > MAX_DEDICATION_LENGTH) {
    throw new Error(
      `[guests] La dedicatoria de "${guest.slug}" tiene ${visibleLength} caracteres visibles; ` +
        `el máximo permitido es ${MAX_DEDICATION_LENGTH}.`
    );
  }
  if (guest.inviteId.length < MIN_INVITE_ID_LENGTH) {
    throw new Error(
      `[guests] El inviteId de "${guest.slug}" tiene ${guest.inviteId.length} caracteres; ` +
        `el mínimo requerido es ${MIN_INVITE_ID_LENGTH}.`
    );
  }
  if (seenInviteIds.has(guest.inviteId)) {
    throw new Error(`[guests] inviteId duplicado: "${guest.inviteId}" (slug "${guest.slug}").`);
  }
  seenInviteIds.add(guest.inviteId);
}
