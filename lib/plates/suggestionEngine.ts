import type { StateRules } from "./types";
import { validatePlate } from "./validation.ts";

export type SuggestionStyle = "funny" | "minimal" | "business" | "car";

export type SuggestionInput = {
  word: string;
  style?: SuggestionStyle;
  number?: string;
  rules: StateRules;
};

export type SuggestionTag =
  | "original"
  | "leet"
  | "vowel-dropped"
  | "vowel-dropped-leet"
  | "prefix-number"
  | "suffix-number"
  | "truncated";

export type Suggestion = {
  plate: string;
  score: number;
  tags: SuggestionTag[];
  breakdown: {
    similarity: number;
    readability: number;
    memorability: number;
    lengthFit: number;
    numericSubstitutionCount: number;
    ruleCompliance: number;
  };
};

// Deliberately small and readable-preserving — this is a vanity plate, not a
// password. Every substitution trades readability for "leetness", so we cap
// how many get applied at once (see MAX_LEET_SUBS) rather than exhausting
// every combination.
const LEET_MAP: Record<string, string> = { E: "3", A: "4", I: "1", O: "0", S: "5" };
const MAX_LEET_SUBS = 2;
const MAX_CANDIDATES_RETURNED = 12;

const STYLE_TAG_BONUS: Record<SuggestionStyle, Partial<Record<SuggestionTag, number>>> = {
  funny: { leet: 0.15, "vowel-dropped-leet": 0.12 },
  minimal: { "vowel-dropped": 0.2, truncated: 0.1 },
  business: { original: 0.15, truncated: 0.05 },
  car: { "suffix-number": 0.1, "prefix-number": 0.08, leet: 0.05 },
};

// Unlike the bonus above (a ranking nudge), this actually changes which
// candidates are eligible to appear at all — a small score bonus on an
// already-short candidate list rarely reorders anything a user would
// notice, so "pick a style" looked like it did nothing. Each predicate
// describes the tag shape that style is *for*; generateSuggestions falls
// back to the unfiltered set if nothing matches (a short word may not
// have any leet-eligible letters, for instance) so a style choice never
// produces zero results on its own.
const STYLE_TAG_FILTER: Record<SuggestionStyle, (tags: SuggestionTag[]) => boolean> = {
  funny: (tags) => tags.includes("leet") || tags.includes("vowel-dropped-leet"),
  minimal: (tags) =>
    (tags.includes("vowel-dropped") || tags.includes("truncated")) &&
    !tags.includes("leet") &&
    !tags.includes("vowel-dropped-leet"),
  business: (tags) => !tags.includes("leet") && !tags.includes("vowel-dropped-leet"),
  car: (tags) => tags.includes("prefix-number") || tags.includes("suffix-number") || tags.includes("leet"),
};

function lettersOnly(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

// Standard edit distance — used to score how far a candidate strayed from
// the word the user actually typed.
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function similarityScore(candidateLetters: string, originalLetters: string): number {
  if (originalLetters.length === 0) return 0;
  const maxLen = Math.max(candidateLetters.length, originalLetters.length);
  if (maxLen === 0) return 1;
  const distance = levenshtein(candidateLetters, originalLetters);
  return Math.max(0, 1 - distance / maxLen);
}

// Positions eligible for a leet swap, in order — capped so the combination
// count stays small (see MAX_LEET_SUBS) instead of enumerating every subset.
function leetEligiblePositions(word: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (LEET_MAP[word[i]]) positions.push(i);
  }
  return positions;
}

function applyLeetAt(word: string, positions: number[]): string {
  const chars = word.split("");
  for (const pos of positions) {
    chars[pos] = LEET_MAP[chars[pos]] ?? chars[pos];
  }
  return chars.join("");
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function leetVariants(word: string): { value: string; subCount: number }[] {
  const eligible = leetEligiblePositions(word).slice(0, 6); // bound the search space
  const variants: { value: string; subCount: number }[] = [];
  for (let subs = 1; subs <= Math.min(MAX_LEET_SUBS, eligible.length); subs++) {
    for (const combo of combinations(eligible, subs)) {
      variants.push({ value: applyLeetAt(word, combo), subCount: subs });
    }
  }
  return variants;
}

// Keeps the first letter even if it's a vowel — dropping it too makes the
// result unrecognizable as a name/word, which defeats the point.
function stripVowels(word: string): string {
  if (word.length === 0) return word;
  return word[0] + word.slice(1).replace(/[AEIOU]/g, "");
}

function fitToMax(value: string, maxCharacters: number): string {
  return value.slice(0, maxCharacters);
}

// A candidate that's drifted this far from both the requested word and any
// recognizable structure isn't a useful suggestion, regardless of how it was
// produced — this is the backstop for any future non-deterministic
// suggestion source (see the SuggestionInput -> Suggestion interface), since
// every transform generated in this file is already controlled by
// construction.
function isGibberish(candidateLetters: string, originalLetters: string): boolean {
  if (candidateLetters.length === 0) return true;
  if (/(.)\1{2,}/.test(candidateLetters) && !/(.)\1{2,}/.test(originalLetters)) return true;
  return similarityScore(candidateLetters, originalLetters) < 0.15;
}

function buildCandidates(word: string, number: string | undefined, rules: StateRules): Map<string, SuggestionTag[]> {
  const base = lettersOnly(word);
  const num = number ? digitsOnly(number) : "";
  const candidates = new Map<string, SuggestionTag[]>();

  function add(value: string, tags: SuggestionTag[]) {
    const fitted = fitToMax(value, rules.maxCharacters);
    if (fitted.length === 0) return;
    const existing = candidates.get(fitted);
    candidates.set(fitted, existing ? Array.from(new Set([...existing, ...tags])) : tags);
  }

  if (base.length === 0) return candidates;

  const wasTruncated = (v: string) => v.length > rules.maxCharacters;

  // Plain word, and its leet/vowel-dropped relatives.
  add(base, wasTruncated(base) ? ["original", "truncated"] : ["original"]);

  const vowelDropped = stripVowels(base);
  if (vowelDropped !== base) add(vowelDropped, ["vowel-dropped"]);

  for (const { value } of leetVariants(base)) {
    add(value, ["leet"]);
  }
  for (const { value } of leetVariants(vowelDropped)) {
    if (value !== vowelDropped) add(value, ["vowel-dropped-leet"]);
  }

  // Word + requested number, both orders, trimming the word (not the
  // number) if the combination doesn't fit.
  if (num.length > 0) {
    const room = Math.max(0, rules.maxCharacters - num.length);
    const wordFits = base.slice(0, room);
    const vowelFits = vowelDropped.slice(0, room);
    if (wordFits.length > 0) {
      add(wordFits + num, ["suffix-number"]);
      add(num + wordFits, ["prefix-number"]);
    }
    if (vowelFits.length > 0 && vowelFits !== wordFits) {
      add(vowelFits + num, ["suffix-number", "vowel-dropped"]);
      add(num + vowelFits, ["prefix-number", "vowel-dropped"]);
    }
  }

  return candidates;
}

function scoreCandidate(
  plate: string,
  tags: SuggestionTag[],
  originalLetters: string,
  rules: StateRules,
  style: SuggestionStyle | undefined
): Suggestion {
  const candidateLetters = lettersOnly(plate);
  const numericCount = leetEligiblePositions(originalLetters).length > 0
    ? Array.from(plate).filter((ch, i) => Object.values(LEET_MAP).includes(ch) && lettersOnly(originalLetters)[i] !== ch).length
    : 0;

  const similarity = similarityScore(candidateLetters, originalLetters);
  const readability = Math.max(0, 1 - 0.15 * numericCount - (tags.includes("vowel-dropped") ? 0.1 : 0));
  const memorability = Math.max(
    0,
    Math.min(1, 1 - (plate.length - 3) / Math.max(1, rules.maxCharacters)) + (tags.includes("original") ? 0.2 : 0)
  );
  const lengthFit = Math.min(1, plate.length / rules.maxCharacters);
  const ruleCompliance = 1;

  let score =
    similarity * 0.3 +
    readability * 0.25 +
    Math.min(1, memorability) * 0.2 +
    lengthFit * 0.15 +
    ruleCompliance * 0.1 -
    Math.max(0, numericCount - 1) * 0.03;

  if (style) {
    for (const tag of tags) {
      score += STYLE_TAG_BONUS[style][tag] ?? 0;
    }
  }

  return {
    plate,
    score: Math.round(Math.min(1, Math.max(0, score)) * 1000) / 1000,
    tags,
    breakdown: {
      similarity: Math.round(similarity * 1000) / 1000,
      readability: Math.round(readability * 1000) / 1000,
      memorability: Math.round(Math.min(1, memorability) * 1000) / 1000,
      lengthFit: Math.round(lengthFit * 1000) / 1000,
      numericSubstitutionCount: numericCount,
      ruleCompliance,
    },
  };
}

export function generateSuggestions(input: SuggestionInput): Suggestion[] {
  const { word, style, number, rules } = input;
  const originalLetters = lettersOnly(word);
  if (originalLetters.length === 0) return [];

  const candidates = buildCandidates(word, number, rules);
  const scored: Suggestion[] = [];

  for (const [plate, tags] of candidates) {
    if (isGibberish(lettersOnly(plate), originalLetters)) continue;
    if (!validatePlate(plate, rules).valid) continue;
    scored.push(scoreCandidate(plate, tags, originalLetters, rules, style));
  }

  const filtered = style ? scored.filter((s) => STYLE_TAG_FILTER[style](s.tags)) : scored;
  const pool = filtered.length > 0 ? filtered : scored;
  pool.sort((a, b) => b.score - a.score);

  const deduped: Suggestion[] = [];
  const seen = new Set<string>();
  for (const s of pool) {
    if (seen.has(s.plate)) continue;
    seen.add(s.plate);
    deduped.push(s);
    if (deduped.length >= MAX_CANDIDATES_RETURNED) break;
  }
  return deduped;
}
