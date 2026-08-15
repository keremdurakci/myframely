import type { StateRules } from "./types";

// Canonical form used for cache keys, dedup, and DB lookups — same input
// should always normalize the same way regardless of how a user typed it
// (spacing/casing/hyphens), so `state_code + normalized_plate` stays a
// reliable unique key across plate_availability and watch_daily_checks.
export function normalizePlate(raw: string, rules: StateRules): string {
  let value = raw.toUpperCase().trim();

  if (!rules.supportsHyphens) value = value.replace(/-+/g, "");
  if (!rules.supportsSpaces) {
    value = value.replace(/\s+/g, "");
  } else {
    value = value.replace(/\s+/g, " ");
  }

  return value;
}
