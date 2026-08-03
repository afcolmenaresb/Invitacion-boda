export interface Guest {
  /** URL-safe slug, e.g. /estefi-y-matias. Lowercase, hyphen-separated, no ampersands. */
  slug: string;
  /** Guest name(s) as shown on the invitation. Recommended max 32 characters. */
  displayName: string;
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

// Test data only — the definitive guest list is not loaded yet.
export const guests: Guest[] = [
  {
    slug: 'ana',
    displayName: 'Ana',
    dedication: 'Gracias por acompañarnos en este nuevo comienzo.',
  },
  {
    slug: 'estefi-y-matias',
    displayName: 'Estefi y Matías',
    dedication: 'Hay viajes que no tendrían el mismo sentido sin ciertas personas.',
  },
  {
    slug: 'familia-gonzalez-benitez',
    displayName: 'Familia González Benítez',
    dedication:
      'Desde el primer encuentro supimos que esta familia sería parte esencial de la historia que hoy comenzamos a escribir juntos.',
  },
  {
    slug: 'maria-fernanda-y-juan-sebastian',
    displayName: 'María Fernanda y Juan Sebastián',
    dedication: 'Su presencia hará que este viaje tenga un sentido aún más especial para nosotros dos.',
  },
];

export function getGuestBySlug(slug: string): Guest | undefined {
  return guests.find((guest) => guest.slug === slug);
}

// Runs at module load, i.e. every `astro dev`/`astro build` -- this module
// only ever executes on the server/build side, never in the browser. Fails
// loudly and early, naming the offending guest and the length found, rather
// than letting an over-length dedication reach Cover.astro's height-fit
// fallback silently.
for (const guest of guests) {
  const visibleLength = getVisibleDedicationLength(guest.dedication);
  if (visibleLength > MAX_DEDICATION_LENGTH) {
    throw new Error(
      `[guests] La dedicatoria de "${guest.slug}" tiene ${visibleLength} caracteres visibles; ` +
        `el máximo permitido es ${MAX_DEDICATION_LENGTH}.`
    );
  }
}
