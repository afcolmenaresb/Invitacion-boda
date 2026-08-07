/**
 * Small, self-contained "ink reveal" mechanism for handwritten text: split
 * text into per-rendered-line wrappers, then reveal each line with a single
 * animated clip-path sweep (a slightly jagged rectangle growing left to
 * right, with vertical bleed so ascenders/descenders/accents are never cut)
 * -- never mask-image, never a textContent/innerHTML swap at the end.
 *
 * This re-implements the exact mechanism already approved and shipping in
 * Cover.astro's own guest-name/dedication reveal (see that file's
 * splitIntoLines/triggerLineReveal/lineClipPath), as a standalone utility.
 * It is intentionally NOT imported by Cover.astro and Cover.astro is not
 * touched by it -- the goal is to reuse the *mechanism*, proven stable
 * there, for MemoryScene's own reveal without refactoring the approved
 * portada. The tradeoff is a small amount of duplication with Cover.astro's
 * private script (the algorithm itself is tiny and stable, not something
 * likely to diverge) in exchange for zero risk to the portada's own
 * behavior.
 */

export const DEFAULT_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

// Horizontal bleed lives in each line's own box (padding + equal negative
// margin -- see the .ink-line CSS wherever this is used), not in the
// clip-path polygon itself: see lineClipPath below for why a fixed
// negative/over-100% coordinate in the polygon would leak ink early.
export const LINE_BLEED_EM = 0.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// The left edge is always a flat 0% -- never negative, never animated.
// Top/bottom get a constant vertical bleed; only the right edge sweeps,
// from 0% to 100% of the (bleed-widened) box, with an irregular jitter
// riding that moving edge so it reads as a hand-drawn stroke rather than a
// ruled line. At percent >= 100 every jittered point clamps to the same
// 100%, so the fully-revealed frame is a plain straight edge already at
// the box's true boundary -- identical to removing the clip-path entirely.
function lineClipPath(percent: number, seed: number): string {
  const steps = 7;
  const verticalBleed = `${LINE_BLEED_EM}em`;
  const left = '0%';
  const top = `-${verticalBleed}`;
  const bottom = `calc(100% + ${verticalBleed})`;

  const points = [`${left} ${top}`];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const jitter = Math.sin((t * 6 + seed) * 3.7) * 2.2;
    const x = clamp(percent + jitter, 0, 100);
    points.push(`${x.toFixed(2)}% ${(t * 100).toFixed(2)}%`);
  }
  points.push(`${left} ${bottom}`);
  return `polygon(${points.join(', ')})`;
}

// A word that itself wraps across two rendered lines (offsetTop alone
// would misattribute it to only its first line) is split at the real
// render break into two plain .ink-word spans -- a no-op for the vast
// majority of words that only ever render on one line.
function splitWrappedWordSpan(span: HTMLElement): HTMLElement[] {
  const text = span.textContent ?? '';
  const textNode = span.firstChild;
  if (!textNode || text.length < 2) return [span];

  const range = document.createRange();
  const firstTop = span.getClientRects()[0]?.top;
  if (firstTop === undefined) return [span];

  let splitIndex = -1;
  for (let i = 1; i < text.length; i++) {
    range.setStart(textNode, 0);
    range.setEnd(textNode, i);
    const rects = range.getClientRects();
    const lastRect = rects[rects.length - 1];
    if (lastRect && Math.abs(lastRect.top - firstTop) > 1) {
      splitIndex = i - 1;
      break;
    }
  }
  if (splitIndex < 1 || splitIndex >= text.length) return [span];

  const firstSpan = document.createElement('span');
  firstSpan.className = 'ink-word';
  firstSpan.textContent = text.slice(0, splitIndex);
  const secondSpan = document.createElement('span');
  secondSpan.className = 'ink-word';
  secondSpan.textContent = text.slice(splitIndex);
  span.replaceWith(firstSpan, secondSpan);
  return [firstSpan, secondSpan];
}

/**
 * Wraps each word in `el` in a span, measures its rendered line via
 * offsetTop, then regroups the words into one `.ink-line` wrapper per
 * visual line -- works for any text length/line count without hard-coding
 * a line count. Safe to call again later (e.g. a second play-through): it
 * always rebuilds from the element's own current textContent, and
 * resetLineUnit (below) never touches textContent, so nothing is lost
 * between runs.
 */
export function splitIntoLines(el: HTMLElement): HTMLElement[] {
  const original = el.textContent ?? '';
  const tokens = original.match(/\S+\s*/g) ?? [original];

  el.textContent = '';
  let wordEls = tokens.map((token) => {
    const span = document.createElement('span');
    span.className = 'ink-word';
    span.textContent = token;
    el.appendChild(span);
    return span;
  });

  wordEls = wordEls.flatMap((span) => (span.getClientRects().length > 1 ? splitWrappedWordSpan(span) : [span]));

  const lineMap = new Map<number, HTMLElement[]>();
  wordEls.forEach((span) => {
    const top = span.offsetTop;
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(span);
  });

  const tops = [...lineMap.keys()].sort((a, b) => a - b);
  el.textContent = '';
  return tops.map((top) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'ink-line';
    lineMap.get(top)!.forEach((span) => lineEl.appendChild(span));
    el.appendChild(lineEl);
    return lineEl;
  });
}

/** Sets the fully-hidden state instantly (no transition) -- call this
 * synchronously, right after splitIntoLines, before anything paints. */
export function prepareLineHidden(el: HTMLElement, seed: number) {
  el.style.transition = 'none';
  el.style.clipPath = lineClipPath(-10, seed);
}

/**
 * Animates one line from hidden to fully revealed via a real CSS
 * transition on clip-path (natively animatable, no custom-property/mask
 * interplay to disagree with). Clears the clip-path right after its own
 * transition ends -- not just once globally at the end of the whole
 * sequence -- so every line is provably left in the exact same state as
 * if the clip-path had never been applied (no permanent clip relied on,
 * no reflow, no textContent swap).
 */
export function triggerLineReveal(
  el: HTMLElement,
  duration: number,
  delay: number,
  seed: number,
  ease: string = DEFAULT_EASE
) {
  el.style.transition = `clip-path ${duration}ms ${ease} ${delay}ms`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.clipPath = lineClipPath(112, seed);
    });
  });

  el.addEventListener(
    'transitionend',
    (ev) => {
      if (ev.propertyName !== 'clip-path') return;
      requestAnimationFrame(() => {
        el.style.clipPath = '';
        el.style.transition = '';
      });
    },
    { once: true }
  );
}

/** Whatever state a line's clip-path is in, this always lands on the
 * normal, fully-visible resting state -- the fallback/reset path. */
export function resetLineUnit(el: HTMLElement) {
  el.style.clipPath = '';
  el.style.transition = '';
}

const LINE_OVERLAP_MS = 210;
const MIN_LINE_DURATION_MS = 420;

/**
 * Reveals several already-split lines top-to-bottom as one continuous
 * gesture: each line's share of `totalDuration` is weighted by its actual
 * rendered width (not char count), and the next line begins slightly
 * before the previous one fully settles so the block reads as a single
 * unbroken stroke. Returns the total elapsed ms until the last line
 * settles.
 */
export function revealLines(lines: HTMLElement[], totalDuration: number, seedBase: number): number {
  const n = lines.length;
  if (n === 0) return 0;
  if (n === 1) {
    triggerLineReveal(lines[0], totalDuration, 0, seedBase);
    return totalDuration;
  }

  const widths = lines.map((line) => Math.max(line.scrollWidth, 1));
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const overlapBudget = LINE_OVERLAP_MS * (n - 1);
  const durationBudget = Math.max(totalDuration - overlapBudget, totalDuration * 0.6);

  let durations = widths.map((w) => Math.max(MIN_LINE_DURATION_MS, durationBudget * (w / totalWidth)));
  const sum = durations.reduce((a, b) => a + b, 0);
  const scale = sum > 0 ? durationBudget / sum : 1;
  durations = durations.map((d) => d * scale);

  let cursor = 0;
  lines.forEach((line, i) => {
    triggerLineReveal(line, durations[i], cursor, seedBase + i);
    if (i < n - 1) cursor += durations[i] - LINE_OVERLAP_MS;
  });
  return cursor + durations[n - 1];
}
