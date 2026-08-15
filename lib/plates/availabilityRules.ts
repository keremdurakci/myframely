// Pure, dependency-free helpers for lib/plates/availability.ts — kept in
// their own file (no Supabase import) so they can be unit tested directly
// without pulling in a live DB client.

// After this many consecutive live-check failures for a state, stop
// attempting live checks entirely until a success resets the counter —
// this is what keeps a struggling/blocking DMV site from getting hammered
// with retries, and is a compliance requirement (see westVirginia.ts),
// not just a cost optimization.
export const CIRCUIT_BREAKER_THRESHOLD = 3;

export function isCacheFresh(checkedAt: string, cacheTtlMinutes: number, now: number): boolean {
  return now - new Date(checkedAt).getTime() <= cacheTtlMinutes * 60_000;
}

export function nextHealthStatus(consecutiveErrors: number): "HEALTHY" | "DEGRADED" {
  return consecutiveErrors >= CIRCUIT_BREAKER_THRESHOLD ? "DEGRADED" : "HEALTHY";
}
