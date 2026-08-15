import type { StateRules } from "./types";

export type ValidationResult = { valid: true } | { valid: false; reason: string };

// Expects an already-normalized plate (see normalize.ts) — state rules live
// entirely in `rules` (sourced from state_configs.rules_json), never
// hardcoded per-state logic here or in the UI.
export function validatePlate(normalizedPlate: string, rules: StateRules): ValidationResult {
  // Character-limit rules count visible characters, not formatting — a
  // state that supports spaces doesn't count them against the limit. This
  // only strips spaces (never hyphens) since a state that doesn't support
  // hyphens will already have had them removed by normalizePlate; if one
  // shows up anyway, the allowed-characters check below must catch it, not
  // silently pass it through.
  const lengthBasis = rules.supportsSpaces ? normalizedPlate.replace(/\s/g, "") : normalizedPlate;

  if (lengthBasis.length < rules.minCharacters) {
    return { valid: false, reason: `Must be at least ${rules.minCharacters} characters` };
  }
  if (lengthBasis.length > rules.maxCharacters) {
    return { valid: false, reason: `Must be at most ${rules.maxCharacters} characters` };
  }

  const allowedPattern = new RegExp(`^[${rules.allowedCharacters}]+$`);
  if (!allowedPattern.test(normalizedPlate)) {
    return { valid: false, reason: "Contains characters not allowed for this state" };
  }

  for (const pattern of rules.forbiddenPatterns ?? []) {
    if (new RegExp(pattern, "i").test(normalizedPlate)) {
      return { valid: false, reason: "This combination isn't allowed" };
    }
  }

  return { valid: true };
}
