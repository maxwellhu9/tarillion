/**
 * Answer matching and scoring rules. No database access, so it can be
 * tested on its own.
 */

export const MAX_STRIKES = 3;
export const GOLDEN_RAM_BONUS = 250;
/** Below this many finished plays, a prompt uses each answer's base rarity. */
export const MIN_PLAYS_FOR_LIVE_RARITY = 20;

/** Lowercase, strip accents and punctuation, drop a leading "the". */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the /, "");
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return prev[b.length];
}

/** Typos allowed for a word of this length: none for short words. */
function allowedTypos(length: number): number {
  if (length >= 9) return 2;
  if (length >= 5) return 1;
  return 0;
}

type Matchable = { id: number; text: string; aliases: string[] };

/**
 * Returns the answer a guess refers to, or null. An exact match (after
 * normalizing) wins; otherwise the closest answer within the typo limit,
 * as long as there is only one closest answer.
 */
export function matchAnswer<T extends Matchable>(
  guess: string,
  answers: T[],
): T | null {
  const g = normalize(guess);
  if (!g) return null;

  let best: T | null = null;
  let bestDistance = Infinity;
  let tied = false;

  for (const answer of answers) {
    for (const candidate of [answer.text, ...answer.aliases]) {
      const c = normalize(candidate);
      if (c === g) return answer;
      const distance = levenshtein(g, c);
      if (distance > allowedTypos(Math.min(g.length, c.length))) continue;
      if (distance < bestDistance) {
        best = answer;
        bestDistance = distance;
        tied = false;
      } else if (distance === bestDistance && best?.id !== answer.id) {
        tied = true;
      }
    }
  }
  return tied ? null : best;
}

/** 5–100. Higher means fewer players found the answer. */
export function rarity(
  answer: { baseRarity: number; timesFound: number },
  finishedPlays: number,
): number {
  if (finishedPlays < MIN_PLAYS_FOR_LIVE_RARITY) return answer.baseRarity;
  const foundRate = Math.min(1, answer.timesFound / finishedPlays);
  return Math.min(100, Math.max(5, Math.round(100 * (1 - foundRate))));
}

/** Today's date (YYYY-MM-DD) in Chapel Hill. */
export function todayInChapelHill(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
  }).format(new Date());
}
