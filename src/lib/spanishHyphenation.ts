/**
 * Deterministic, rule-based Spanish orthographic syllabifier used to insert
 * optional line-break points (soft hyphens, U+00AD) into a dedication before
 * it's rendered -- see hyphenateSpanishText() below, the single export
 * Cover.astro actually calls.
 *
 * Why not CSS `hyphens: auto`? Its dictionary-based hyphenation quality and
 * even its *availability* for `lang="es"` varies across browsers/engines,
 * so the exact same dedication could wrap differently (or not hyphenate at
 * all) depending on the visitor's browser -- not acceptable for a fixed,
 * pixel-measured protected zone. This module instead runs once, at build
 * time, and bakes in the same, fully deterministic soft hyphens (U+00AD)
 * regardless of the browser that later renders them -- U+00AD's "only
 * visible if actually broken" behavior is itself universally supported,
 * unlike automatic hyphenation quality/availability.
 *
 * The rules implemented are the standard Spanish orthographic syllable
 * -division rules taught in style guides (RAE-aligned), not a full
 * phonetic/dialectal analysis:
 *   - "ch", "ll", "rr" are inseparable single units, never split.
 *   - A single consonant between vowels attaches to the *following* vowel.
 *   - Two consonants split one/one, UNLESS they're one of the standard
 *     inseparable onset clusters (pl, pr, bl, br, cl, cr, gl, gr, fl, fr,
 *     tl, tr, dr), which stay together and attach to the following vowel.
 *   - Three or more consonants: recursively, only the last one or two
 *     (per the same inseparable-pair check) attach to the following vowel;
 *     everything before that attaches to the preceding syllable.
 *   - Two vowels are a diphthong (same syllable) unless: both are "strong"
 *     (a, e, o) -- always hiatus -- or either is an accented "weak" vowel
 *     (í, ú) -- an accented í/ú always forces hiatus (e.g. "pa-ís", "grú-a").
 *
 * This intentionally does not attempt full linguistic accuracy for every
 * dialectal or loanword edge case -- it's good enough to produce safe,
 * plausible break points for real-world dedication text, and every point it
 * proposes is still a linguistically valid syllable boundary or better,
 * per the rules above.
 */

const SOFT_HYPHEN = '\u00AD';

const VOWELS_LOWER = 'aeiouáéíóúü';
const STRONG_LOWER = 'aeoáéó';
const WEAK_ACCENTED_LOWER = 'íú';
const DIGRAPHS = ['ch', 'll', 'rr'];
const INSEPARABLE_ONSETS = new Set([
  'pl', 'pr', 'bl', 'br', 'cl', 'cr', 'gl', 'gr', 'fl', 'fr', 'tl', 'tr', 'dr',
]);

// Minimum characters required on each side of a break point -- standard
// typographic rule: never leave a single dangling letter on either line.
const MIN_FRAGMENT_LENGTH = 2;

// Editorial tiers, by the dedication's own *visible* length (soft hyphens
// excluded): short dedications were coming out with distracting, unneeded
// hyphens ("ten-drían", "senti-do") -- these tiers hold hyphenation back
// until the text is actually long enough to need the help, and even then
// only for words long enough that they're plausibly the ones causing it.
const HYPHENATION_TIER_LOW_MAX_LEN = 90; // <= this: no auto-hyphenation at all
const HYPHENATION_TIER_MID_MAX_LEN = 120; // <= this: only long words, capped
const HYPHENATION_TIER_MID_MIN_WORD_LENGTH = 12;
const HYPHENATION_TIER_MID_MAX_WORDS = 3;
// > HYPHENATION_TIER_MID_MAX_LEN: normal, unrestricted hyphenation -- a
// genuinely long dedication (up to the 160-char cap) can have many long
// words that all really do need help, so no cap applies here.
const HYPHENATION_TIER_HIGH_MIN_WORD_LENGTH = 6;

function isVowelChar(ch: string): boolean {
  return VOWELS_LOWER.includes(ch.toLowerCase());
}

function isLetter(ch: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(ch);
}

// Two adjacent vowels are a diphthong (kept in the same syllable) unless
// this returns true (hiatus -- split into separate syllables).
function isHiatus(a: string, b: string): boolean {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  const aStrong = STRONG_LOWER.includes(la);
  const bStrong = STRONG_LOWER.includes(lb);
  const aWeakAccented = WEAK_ACCENTED_LOWER.includes(la);
  const bWeakAccented = WEAK_ACCENTED_LOWER.includes(lb);
  return (aStrong && bStrong) || aWeakAccented || bWeakAccented;
}

// Tokenizes a word into letter-groups, treating "ch"/"ll"/"rr" as one
// inseparable unit each (case-insensitively), everything else per-character.
function tokenize(word: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < word.length) {
    const two = word.slice(i, i + 2).toLowerCase();
    if (DIGRAPHS.indexOf(two) !== -1) {
      tokens.push(word.slice(i, i + 2));
      i += 2;
    } else {
      tokens.push(word[i]);
      i += 1;
    }
  }
  return tokens;
}

// Given the consonant-token cluster between two vowel nuclei, returns the
// index (within that cluster) where the *following* syllable starts --
// i.e. how many of the cluster's tokens stay with the preceding syllable.
function followingSyllableStartInCluster(cluster: string[]): number {
  if (cluster.length === 0) return 0;
  if (cluster.length === 1) return 0;
  const last = cluster[cluster.length - 1];
  const secondLast = cluster[cluster.length - 2];
  const bothSingleLetter = last.length === 1 && secondLast.length === 1;
  const pair = (secondLast + last).toLowerCase();
  const inseparable = bothSingleLetter && INSEPARABLE_ONSETS.has(pair);
  return inseparable ? cluster.length - 2 : cluster.length - 1;
}

/**
 * Splits a single word into its orthographic syllables. Returns [word]
 * unchanged if it contains anything other than Spanish letters, or has no
 * vowels at all (nothing meaningful to syllabify -- e.g. an initialism).
 */
export function syllabifySpanishWord(word: string): string[] {
  if (word.length === 0) return [word];
  for (let i = 0; i < word.length; i++) {
    if (!isLetter(word[i])) return [word];
  }

  const tokens = tokenize(word);
  const isVowelToken = (t: string) => t.length === 1 && isVowelChar(t);

  const vowelIdx: number[] = [];
  tokens.forEach((t, idx) => {
    if (isVowelToken(t)) vowelIdx.push(idx);
  });
  if (vowelIdx.length === 0) return [word];

  // Group consecutive vowel-token indices into nucleus runs.
  const nucleusRuns: number[][] = [];
  let run: number[] = [vowelIdx[0]];
  for (let k = 1; k < vowelIdx.length; k++) {
    if (vowelIdx[k] === vowelIdx[k - 1] + 1) {
      run.push(vowelIdx[k]);
    } else {
      nucleusRuns.push(run);
      run = [vowelIdx[k]];
    }
  }
  nucleusRuns.push(run);

  // Split each run further at hiatus boundaries into "cores" -- each core
  // is one syllable's vowel nucleus (a monophthong, diphthong or triphthong).
  const cores: number[][] = [];
  for (const r of nucleusRuns) {
    let block: number[] = [r[0]];
    for (let k = 1; k < r.length; k++) {
      const a = tokens[r[k - 1]];
      const b = tokens[r[k]];
      if (isHiatus(a, b)) {
        cores.push(block);
        block = [r[k]];
      } else {
        block.push(r[k]);
      }
    }
    cores.push(block);
  }

  // For each boundary between two cores, find where the following
  // syllable's leading consonants actually start.
  const nextLeadStart: number[] = []; // nextLeadStart[s] = lead start of core s+1
  for (let s = 0; s < cores.length - 1; s++) {
    const prevCoreEnd = cores[s][cores[s].length - 1];
    const nextCoreStart = cores[s + 1][0];
    const cluster = tokens.slice(prevCoreEnd + 1, nextCoreStart);
    const startInCluster = followingSyllableStartInCluster(cluster);
    nextLeadStart.push(prevCoreEnd + 1 + startInCluster);
  }

  const syllables: string[] = [];
  for (let s = 0; s < cores.length; s++) {
    const leadStart = s === 0 ? 0 : nextLeadStart[s - 1];
    const trailEnd = s === cores.length - 1 ? tokens.length - 1 : nextLeadStart[s] - 1;
    syllables.push(tokens.slice(leadStart, trailEnd + 1).join(''));
  }

  return syllables;
}

/**
 * Inserts a soft hyphen (U+00AD) at every syllable boundary of `word` that's
 * a safe break point (at least MIN_FRAGMENT_LENGTH characters on each side),
 * skipping words shorter than `minWordLength` (tier-dependent -- see the
 * HYPHENATION_TIER_* constants). Case/accents are preserved verbatim -- only
 * U+00AD characters are added, nothing else changes.
 */
export function hyphenateSpanishWord(word: string, minWordLength: number): string {
  if (word.length < minWordLength) return word;
  const syllables = syllabifySpanishWord(word);
  if (syllables.length < 2) return word;

  let result = '';
  let consumed = 0;
  for (let i = 0; i < syllables.length; i++) {
    result += syllables[i];
    consumed += syllables[i].length;
    const isLastSyllable = i === syllables.length - 1;
    if (!isLastSyllable) {
      const remaining = word.length - consumed;
      if (consumed >= MIN_FRAGMENT_LENGTH && remaining >= MIN_FRAGMENT_LENGTH) {
        result += SOFT_HYPHEN;
      }
    }
  }
  return result;
}

const ACRONYM_RE = /^[A-ZÁÉÍÓÚÑ]+$/;
const URL_OR_CODE_RE = /[0-9@/._]/;
const SENTENCE_END_RE = /[.!?]$/;

/**
 * Decides whether `word` should be left completely untouched by automatic
 * hyphenation: proper nouns/surnames/place names (heuristic: capitalized
 * and not the first word of a sentence), acronyms/initialisms (all
 * uppercase), anything that looks like a URL/code (contains a digit or
 * @, /, ., _), and words shorter than `minWordLength`.
 */
function shouldSkipAutoHyphenation(word: string, isSentenceStart: boolean, minWordLength: number): boolean {
  if (word.length < minWordLength) return true;
  if (URL_OR_CODE_RE.test(word)) return true;
  if (word.length > 1 && ACRONYM_RE.test(word)) return true;
  const firstChar = word[0];
  if (firstChar && firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase() && !isSentenceStart) {
    // Capitalized mid-sentence: treat as a proper noun/surname/place name.
    return true;
  }
  return false;
}

function stripSoftHyphens(text: string): string {
  return text.split(SOFT_HYPHEN).join('');
}

/**
 * Applies automatic Spanish hyphenation to an entire dedication string,
 * word by word, preserving all original whitespace and punctuation exactly.
 * A word that already contains a manually-authored soft hyphen (an
 * editorial override, see Guest.dedication's docs) is passed through
 * untouched -- never double-hyphenated, never second-guessed, and never
 * counted against the tier's word cap below.
 *
 * How much auto-hyphenation is applied depends on the dedication's own
 * *visible* length (see the HYPHENATION_TIER_* constants above):
 *   - <= 90 chars: none at all -- short dedications read naturally.
 *   - 91-120 chars: only words of HYPHENATION_TIER_MID_MIN_WORD_LENGTH+
 *     letters, and at most HYPHENATION_TIER_MID_MAX_WORDS of them (the
 *     longest ones win) -- enough to fix a genuinely awkward word without
 *     peppering a short-ish dedication with hyphens.
 *   - > 120 chars: normal, unrestricted hyphenation (HYPHENATION_TIER_HIGH_
 *     MIN_WORD_LENGTH+ letters, no cap) -- a dedication this long can
 *     legitimately have many long words that all need the help.
 */
export function hyphenateSpanishText(text: string): string {
  const visibleLength = stripSoftHyphens(text).length;
  if (visibleLength <= HYPHENATION_TIER_LOW_MAX_LEN) {
    return text;
  }
  const isMidTier = visibleLength <= HYPHENATION_TIER_MID_MAX_LEN;
  const minWordLength = isMidTier ? HYPHENATION_TIER_MID_MIN_WORD_LENGTH : HYPHENATION_TIER_HIGH_MIN_WORD_LENGTH;
  const maxWordsToHyphenate = isMidTier ? HYPHENATION_TIER_MID_MAX_WORDS : Infinity;

  const tokens = text.match(/\S+|\s+/g) ?? [text];

  // First pass: figure out which tokens are eligible at all (not
  // whitespace, no manual override already present, has a letter core,
  // not skipped as a proper noun/acronym/URL/too-short), and decompose
  // each into its lead/core/trail punctuation split -- without hyphenating
  // yet, since the mid tier needs to see *every* candidate before deciding
  // which HYPHENATION_TIER_MID_MAX_WORDS of them actually get it.
  type Parsed = { token: string; isWhitespace: boolean; lead?: string; core?: string; trail?: string; eligible: boolean };
  const parsed: Parsed[] = [];
  let sentenceStart = true;

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      parsed.push({ token, isWhitespace: true, eligible: false });
      continue;
    }
    if (token.indexOf(SOFT_HYPHEN) !== -1) {
      // Manual override already present -- honor it verbatim, never
      // reprocessed, never competing for the tier's word cap.
      parsed.push({ token, isWhitespace: false, eligible: false });
      sentenceStart = SENTENCE_END_RE.test(token);
      continue;
    }

    const match = token.match(/^([^A-Za-zÁÉÍÓÚÑáéíóúñü]*)([A-Za-zÁÉÍÓÚÑáéíóúñü]*)([^A-Za-zÁÉÍÓÚÑáéíóúñü]*)$/);
    const wasSentenceStart = sentenceStart;
    sentenceStart = SENTENCE_END_RE.test(token);

    if (!match || !match[2]) {
      parsed.push({ token, isWhitespace: false, eligible: false });
      continue;
    }
    const [, lead, core, trail] = match;
    const eligible = !shouldSkipAutoHyphenation(core, wasSentenceStart, minWordLength);
    parsed.push({ token, isWhitespace: false, lead, core, trail, eligible });
  }

  // Second pass: among eligible candidates, keep only the longest
  // maxWordsToHyphenate (ties broken by original order) -- the words most
  // plausibly responsible for awkward wrapping.
  const eligibleIndexes = parsed
    .map((p, i) => (p.eligible ? i : -1))
    .filter((i) => i !== -1)
    .sort((a, b) => (parsed[b].core as string).length - (parsed[a].core as string).length);
  const selected = new Set(eligibleIndexes.slice(0, maxWordsToHyphenate));

  return parsed
    .map((p, i) => {
      if (p.isWhitespace || p.lead === undefined) return p.token;
      if (!p.eligible || !selected.has(i)) return p.lead + p.core + p.trail;
      return p.lead + hyphenateSpanishWord(p.core as string, minWordLength) + p.trail;
    })
    .join('');
}
