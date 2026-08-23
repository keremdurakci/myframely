import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "ohio-v1";
const CHECK_URL = "https://bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview";
const REQUEST_TIMEOUT_MS = 10_000;

// Talks to Ohio BMV's own public plate-preview endpoint — the AJAX call
// behind the "Check Availability" button on
// bmvonline.dps.ohio.gov/bmvonline/oplates/specializedplates/1 (the old
// services.dps.ohio.gov host it used to live on has been decommissioned and
// now just redirects visitors here). Verified with a cold, cookie-less GET
// against both a known-taken word ("OHIO") and random available-looking
// strings — no session or antiforgery token needed for this specific call
// (the page's __RequestVerificationToken field is for other POST actions
// like adding to cart, not this GET). bmvonline.dps.ohio.gov has no
// robots.txt at all (404), so nothing there restricts this path either.
//
// The endpoint also rate-limits itself independently of anything this app
// does (roughly a dozen requests/minute trips a 1-minute cooldown, returned
// as its own error message in the same shape as a validation error) —
// mapped to ERROR here rather than a plate status, left for the existing
// cache/circuit-breaker layer (adapter_health) to back off rather than
// retried inline.
export function createOhioAdapter(): StatePlateAdapter {
  return {
    stateCode: "OH",
    adapterVersion: ADAPTER_VERSION,
    validatePlate: (plate: string, rules: StateRules) => validatePlate(plate, rules),
    normalizePlate: (plate: string, rules: StateRules) => normalizePlate(plate, rules),
    checkAvailability: async (normalizedPlate: string): Promise<AvailabilityResult> => {
      const checkedAt = new Date().toISOString();
      const result = (status: AvailabilityResult["status"]): AvailabilityResult => ({
        status,
        checkedAt,
        source: "live",
        adapterVersion: ADAPTER_VERSION,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const url = new URL(CHECK_URL);
        url.searchParams.set("plateNumber", normalizedPlate);
        url.searchParams.set("vehicleClass", "PC");
        url.searchParams.set("organizationCode", "0");

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) return result("ERROR");

        const html = await res.text();
        if (/This plate number is currently available\./i.test(html)) return result("AVAILABLE");
        if (/Plate is issued\./i.test(html)) return result("TAKEN");
        // "Invalid Format." shouldn't happen given our own validatePlate/
        // normalizePlate already enforce Ohio's character rules — treated
        // as UNKNOWN rather than ERROR in case the site's rules are
        // stricter than ours in some edge case we haven't seen.
        if (/Invalid Format\./i.test(html)) return result("UNKNOWN");
        return result("ERROR");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://bmvonline.dps.ohio.gov/bmvonline/oplates/specializedplates/1",
  };
}
