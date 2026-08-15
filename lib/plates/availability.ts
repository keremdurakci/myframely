import { supabaseServer } from "../supabaseServer.ts";
import type { AvailabilityResult, AvailabilityStatus, StateConfig } from "./types";
import { getAdapterForState } from "./adapters/registry.ts";
import { isCacheFresh, nextHealthStatus } from "./availabilityRules.ts";

type CachedRow = {
  normalized_plate: string;
  status: AvailabilityStatus;
  checked_at: string;
  source: string;
  adapter_version: string | null;
};

async function isAdapterDegraded(stateCode: string): Promise<boolean> {
  const { data } = await supabaseServer
    .from("adapter_health")
    .select("status")
    .eq("state_code", stateCode)
    .maybeSingle();
  return data?.status === "DEGRADED";
}

// A single ERROR increments the streak (and may trip the breaker); a single
// AVAILABLE/TAKEN resets it — an UNKNOWN response is left alone since the
// adapter did get an answer, it just couldn't classify it (not a sign the
// integration itself is broken).
async function recordHealthOutcome(stateCode: string, sawError: boolean, sawSuccess: boolean): Promise<void> {
  if (!sawError && !sawSuccess) return;

  if (sawSuccess && !sawError) {
    await supabaseServer.from("adapter_health").upsert(
      { state_code: stateCode, status: "HEALTHY", last_success_at: new Date().toISOString(), consecutive_errors: 0 },
      { onConflict: "state_code" }
    );
    return;
  }

  const { data: existing } = await supabaseServer
    .from("adapter_health")
    .select("consecutive_errors")
    .eq("state_code", stateCode)
    .maybeSingle();
  const consecutiveErrors = (existing?.consecutive_errors ?? 0) + 1;

  await supabaseServer.from("adapter_health").upsert(
    {
      state_code: stateCode,
      status: nextHealthStatus(consecutiveErrors),
      last_error_at: new Date().toISOString(),
      consecutive_errors: consecutiveErrors,
    },
    { onConflict: "state_code" }
  );
}

async function writeCache(
  stateCode: string,
  normalizedPlate: string,
  result: AvailabilityResult,
  previousStatus: AvailabilityStatus | undefined
): Promise<void> {
  await supabaseServer.from("plate_availability").upsert(
    {
      state_code: stateCode,
      plate: normalizedPlate,
      normalized_plate: normalizedPlate,
      status: result.status,
      checked_at: result.checkedAt,
      source: result.source,
      adapter_version: result.adapterVersion ?? null,
    },
    { onConflict: "state_code,normalized_plate" }
  );

  if (previousStatus && previousStatus !== result.status) {
    await supabaseServer.from("plate_status_history").insert({
      state_code: stateCode,
      normalized_plate: normalizedPlate,
      previous_status: previousStatus,
      new_status: result.status,
    });
  }
}

// The single entry point every route/page should use instead of calling an
// adapter directly — handles cache-first reads, the circuit breaker, and
// writing real results back to the cache, for a whole page's worth of
// suggestions in as few round trips as possible (one batched cache read,
// one health check, sequential adapter calls only for what's left uncached,
// one health write, one cache write per new result).
export async function getAvailabilityBatch(
  config: StateConfig,
  normalizedPlates: string[]
): Promise<Map<string, AvailabilityResult>> {
  const results = new Map<string, AvailabilityResult>();
  if (normalizedPlates.length === 0) return results;

  const { data: cachedRows } = await supabaseServer
    .from("plate_availability")
    .select("normalized_plate, status, checked_at, source, adapter_version")
    .eq("state_code", config.stateCode)
    .in("normalized_plate", normalizedPlates);

  const now = Date.now();
  const cachedByPlate = new Map<string, CachedRow>((cachedRows ?? []).map((r) => [r.normalized_plate, r as CachedRow]));
  const remaining: string[] = [];

  for (const plate of normalizedPlates) {
    const row = cachedByPlate.get(plate);
    if (row && isCacheFresh(row.checked_at, config.cacheTtlMinutes, now)) {
      results.set(plate, {
        status: row.status,
        checkedAt: row.checked_at,
        source: "cache",
        adapterVersion: row.adapter_version ?? undefined,
      });
    } else {
      remaining.push(plate);
    }
  }
  if (remaining.length === 0) return results;

  if (!config.liveCheckEnabled) {
    const adapter = getAdapterForState(config);
    for (const plate of remaining) {
      results.set(plate, await adapter.checkAvailability(plate));
    }
    return results;
  }

  if (await isAdapterDegraded(config.stateCode)) {
    const checkedAt = new Date().toISOString();
    for (const plate of remaining) {
      results.set(plate, { status: "ERROR", checkedAt, source: "live" });
    }
    return results;
  }

  const adapter = getAdapterForState(config);
  let sawError = false;
  let sawSuccess = false;

  for (const plate of remaining) {
    const result = await adapter.checkAvailability(plate);
    results.set(plate, result);

    if (result.status === "ERROR") sawError = true;
    if (result.status === "AVAILABLE" || result.status === "TAKEN") {
      sawSuccess = true;
      await writeCache(config.stateCode, plate, result, cachedByPlate.get(plate)?.status);
    }
  }

  await recordHealthOutcome(config.stateCode, sawError, sawSuccess);

  return results;
}
