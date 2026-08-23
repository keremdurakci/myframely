import type { StateRules } from "./types";
import { validatePlate } from "./validation.ts";

// Same substitutions a vanity-plate shopper would reach for themselves —
// the letter still reads as itself at a glance ("L0VE", "LOV3").
const LEET_MAP: Record<string, string> = { E: "3", A: "4", I: "1", O: "0", S: "5" };

// Append a short number — the most common real vanity-plate pattern
// ("LOVE1") and the only strategy that never touches a letter of what was
// actually typed.
function numberSuffixVariants(target: string, maxCharacters: number): string[] {
  const room = maxCharacters - target.length;
  if (room <= 0) return [];
  const maxNum = room >= 2 ? 99 : 9;
  const variants: string[] = [];
  for (let n = 1; n <= maxNum; n++) variants.push(`${target}${n}`);
  return variants;
}

function numberPrefixVariants(target: string, maxCharacters: number): string[] {
  const room = maxCharacters - target.length;
  if (room <= 0) return [];
  const maxNum = room >= 2 ? 99 : 9;
  const variants: string[] = [];
  for (let n = 1; n <= maxNum; n++) variants.push(`${n}${target}`);
  return variants;
}

// Classic leetspeak letter/number swaps. Still immediately readable as the
// original word. Single substitutions first, pairs only if that's not
// enough.
function leetVariants(target: string): string[] {
  const positions: number[] = [];
  for (let i = 0; i < target.length; i++) {
    if (LEET_MAP[target[i]]) positions.push(i);
  }

  const variants: string[] = [];
  for (const pos of positions) {
    const chars = target.split("");
    chars[pos] = LEET_MAP[chars[pos]];
    variants.push(chars.join(""));
  }
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const chars = target.split("");
      chars[positions[i]] = LEET_MAP[chars[positions[i]]];
      chars[positions[j]] = LEET_MAP[chars[positions[j]]];
      variants.push(chars.join(""));
    }
  }
  return variants;
}

// Frame the word with the same digit on both sides ("1ALI1") — a common
// pattern for short words that have room to spare.
function symmetricFramingVariants(target: string, maxCharacters: number): string[] {
  const room = maxCharacters - target.length;
  if (room < 2) return [];
  const variants: string[] = [];
  for (let n = 1; n <= 9; n++) variants.push(`${n}${target}${n}`);
  return variants;
}

// Produces plates related to `target` by mixing four recognizable
// patterns — a trailing number, a leading number, leetspeak swaps, and
// symmetric digit framing — round-robin so the result is a varied mix
// rather than five variations of the same trick. Never falls back to an
// arbitrary nearest-character swap (things like "LOVE" -> "KOVE"): if these
// four patterns don't turn up enough free plates, it just returns fewer.
export function generateNearbyPlates(
  target: string,
  rules: StateRules,
  exclude: Set<string>,
  limit: number
): string[] {
  if (target.length === 0) return [];

  const streams = [
    numberSuffixVariants(target, rules.maxCharacters),
    numberPrefixVariants(target, rules.maxCharacters),
    leetVariants(target),
    symmetricFramingVariants(target, rules.maxCharacters),
  ];
  const cursors = streams.map(() => 0);

  const seen = new Set(exclude);
  const result: string[] = [];

  let madeProgress = true;
  while (result.length < limit && madeProgress) {
    madeProgress = false;
    for (let s = 0; s < streams.length && result.length < limit; s++) {
      const stream = streams[s];
      while (cursors[s] < stream.length) {
        const candidate = stream[cursors[s]++];
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        if (!validatePlate(candidate, rules).valid) continue;
        result.push(candidate);
        madeProgress = true;
        break;
      }
    }
  }

  return result;
}
