import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "kentucky-v1";
const CHECK_URL = "https://secure.kentucky.gov/kytc/plates/web/LicensePlate/Verify";
const REQUEST_TIMEOUT_MS = 10_000;

// "Standard Vehicle" plate (a passenger plate, not the Standard Motorcycle
// or any of the ~40 other special-interest/military/college plate designs
// this same tool also covers) — its own server-assigned GUID, found via
// GET .../LicensePlate/GetLicensePlates?categoryId=<Standard Issue category>.
// Each plate design has its own licensePlateId and its own character rules;
// this is the one that maps to this project's single "personalized plate"
// concept.
const LICENSE_PLATE_ID_STANDARD_VEHICLE = "030af448-0201-471d-b561-d68376752ef6";

// Talks to Kentucky's own public plate-personalization tool
// (secure.kentucky.gov/kytc/plates/web) — a Knockout.js app. The page itself
// is mostly a shell; the real endpoints are set as plain JS properties in
// its App/LicensePlateModel.js-backed viewmodel (found by downloading that
// file directly and reading the constructor, same approach as Tennessee's
// Vue bundle): GET .../LicensePlate/GetCategories, GET
// .../LicensePlate/GetLicensePlates?categoryId=<id>, and the one this
// adapter uses, GET .../LicensePlate/Verify?text=<PLATE>&licensePlateId=<id>.
//
// Verified live, cold, with zero cookies and no prior page visit (a single
// stateless GET is the whole exchange, no session needed): a genuinely
// taken/reserved plate ("LOVE") and a deliberately excluded combination
// (a run of the letter O, which this specific plate design blocks — see
// its "Zero's temporarily unavailable" remark) both come back as the JSON
// string "Requested text: '<PLATE>' is not available." -- confirmed this
// isn't conflated with the invalid-format case (which returns a distinctly
// different message; see below), by testing a plate containing the
// character 'Q' (structurally excluded by this plate design's own
// server-side regex) and getting a different response. A random unused
// string maps to the literal JSON string "OK". No CAPTCHA/session/rate-limit
// hit across many direct real requests (including an 8-request burst).
// secure.kentucky.gov's robots.txt route itself 502s (Azure Application
// Gateway with no robots.txt configured behind it) rather than serving a
// disallow of any kind -- every real app path used here returns normal 200s.
//
// Response classification:
//   "OK"                                    -> AVAILABLE
//   contains "is not available"             -> TAKEN
//   anything else (format-rejection message,
//     non-JSON body, unexpected text)       -> UNKNOWN
// Non-200 status or a network failure/timeout -> ERROR. This function never
// retries and never tries to work around a block; that's the circuit
// breaker's job (adapter_health), not this adapter's.
export function createKentuckyAdapter(): StatePlateAdapter {
  return {
    stateCode: "KY",
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
        const url = `${CHECK_URL}?text=${encodeURIComponent(normalizedPlate)}&licensePlateId=${LICENSE_PLATE_ID_STANDARD_VEHICLE}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return result("ERROR");

        const text = await res.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          return result("ERROR");
        }
        if (typeof parsed !== "string") return result("UNKNOWN");

        if (parsed === "OK") return result("AVAILABLE");
        if (/is not available/i.test(parsed)) return result("TAKEN");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://secure.kentucky.gov/kytc/plates/web",
  };
}
