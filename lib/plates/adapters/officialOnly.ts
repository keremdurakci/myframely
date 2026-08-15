import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "official-only-v1";

// Used for every OFFICIAL_ONLY / PENDING / DISABLED state, and as the safe
// default for any LIVE-mode state whose real adapter isn't built yet or
// has live_check_enabled off. checkAvailability() never makes an outbound
// request — that's the entire point, not a placeholder to fill in later
// for these states specifically (a real LIVE adapter replaces this one
// wholesale via the registry, it doesn't extend it).
export function createOfficialOnlyAdapter(stateCode: string, officialCheckerUrl: string): StatePlateAdapter {
  return {
    stateCode,
    adapterVersion: ADAPTER_VERSION,
    validatePlate: (plate: string, rules: StateRules) => validatePlate(plate, rules),
    normalizePlate: (plate: string, rules: StateRules) => normalizePlate(plate, rules),
    checkAvailability: async (): Promise<AvailabilityResult> => ({
      status: "UNKNOWN",
      checkedAt: new Date().toISOString(),
      source: "manual",
      adapterVersion: ADAPTER_VERSION,
    }),
    getOfficialUrl: () => officialCheckerUrl,
  };
}
