import assert from "node:assert/strict";
import test from "node:test";
import { createOfficialOnlyAdapter } from "../lib/plates/adapters/officialOnly.ts";
import { getAdapterForState } from "../lib/plates/adapters/registry.ts";
import type { StateConfig, StateRules } from "../lib/plates/types.ts";

const RULES: StateRules = {
  minCharacters: 2,
  maxCharacters: 7,
  supportsSpaces: false,
  supportsHyphens: false,
  allowedCharacters: "A-Z0-9",
};

function stateConfig(overrides: Partial<StateConfig> = {}): StateConfig {
  return {
    stateCode: "WV",
    stateName: "West Virginia",
    availabilityMode: "LIVE",
    liveCheckEnabled: false,
    monitoringEnabled: false,
    officialCheckerUrl: "https://apps.wv.gov/DMV/SelfService/PersonalizedPlate/Search",
    cacheTtlMinutes: 1440,
    rules: RULES,
    ...overrides,
  };
}

test("officialOnly adapter never resolves to a definitive status and never claims a live source", async () => {
  const adapter = createOfficialOnlyAdapter("WV", "https://example.gov/check");
  const result = await adapter.checkAvailability("KEREM");
  assert.equal(result.status, "UNKNOWN");
  assert.equal(result.source, "manual");
});

test("officialOnly adapter returns the exact official URL it was given", () => {
  const adapter = createOfficialOnlyAdapter("OH", "https://bmvonline.dps.ohio.gov/x");
  assert.equal(adapter.getOfficialUrl(), "https://bmvonline.dps.ohio.gov/x");
});

test("officialOnly adapter delegates validate/normalize to the shared rules-driven functions", () => {
  const adapter = createOfficialOnlyAdapter("WV", "https://example.gov");
  assert.equal(adapter.normalizePlate("  kr3m  ", RULES), "KR3M");
  assert.equal(adapter.validatePlate("KR3M", RULES).valid, true);
  assert.equal(adapter.validatePlate("A", RULES).valid, false);
});

test("registry falls back to official-only when live checking is disabled", () => {
  const adapter = getAdapterForState(stateConfig({ liveCheckEnabled: false }));
  assert.equal(adapter.adapterVersion, "official-only-v1");
});

test("registry falls back to official-only when no live adapter is registered yet, even if enabled", () => {
  const adapter = getAdapterForState(
    stateConfig({ stateCode: "OH", officialCheckerUrl: "https://example.gov/oh", liveCheckEnabled: true })
  );
  assert.equal(adapter.adapterVersion, "official-only-v1");
});

test("registry resolves WV to the real live adapter once its flag is on", () => {
  const adapter = getAdapterForState(stateConfig({ liveCheckEnabled: true }));
  assert.equal(adapter.adapterVersion, "west-virginia-v1");
});

test("registry still keeps WV on official-only while its flag is off, even though the adapter exists", () => {
  const adapter = getAdapterForState(stateConfig({ liveCheckEnabled: false }));
  assert.equal(adapter.adapterVersion, "official-only-v1");
});

test("registry resolves KS to the real live adapter once its flag is on", () => {
  const adapter = getAdapterForState(
    stateConfig({ stateCode: "KS", officialCheckerUrl: "https://www.kdor.ks.gov/Apps/MotorVehicles", liveCheckEnabled: true })
  );
  assert.equal(adapter.adapterVersion, "kansas-v1");
});

test("every non-LIVE availability mode resolves to official-only regardless of the flag", async () => {
  for (const mode of ["PENDING", "OFFICIAL_ONLY", "DISABLED"] as const) {
    const adapter = getAdapterForState(stateConfig({ availabilityMode: mode, liveCheckEnabled: false }));
    const result = await adapter.checkAvailability("ANY");
    assert.equal(result.source, "manual");
  }
});
