import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "north-dakota-v1";
const CHECK_URL = "https://apps.nd.gov/dot/mv/mvrenewal/plateSearch.htm";
const REQUEST_TIMEOUT_MS = 10_000;

// Standard passenger plate style — not any of the ~60 other specialty/
// military/collegiate plateStyle values this same tool also covers.
const PLATE_STYLE_STANDARD = "SP25LP";

const RESULT_PATTERN = /<p><strong>Plate\s+\S+\s+([\s\S]*?)<\/strong><\/p>/;

// Talks to NDDOT's own public "Special Request Plate Search" tool
// (apps.nd.gov/dot/mv/mvrenewal/plateSearch.htm) — verified by capturing the
// real browser form submission, then reproducing both a taken ("LOVE") and
// an available ("QZX372") result from a cold server-side POST with no prior
// page visit and no cookie priming, getting the identical wording back both
// times ("Plate LOVE is not available." / "Plate QZX372 has not been issued
// or ordered."). No CAPTCHA, no login, no anti-forgery token — the site's
// own 3-step browser wizard (landing page -> plate-style picker -> results)
// turned out to be UI convenience only; the results endpoint accepts a
// direct stateless POST with its own fresh session. apps.nd.gov has no
// robots.txt at all (404), so nothing there restricts this path either.
//
// Anything other than the two known result phrases — different wording,
// non-200 status, no matching result block (e.g. an HTML error/maintenance
// page), a network failure or timeout — is reported as ERROR and left
// there. This function never retries and never tries to work around a
// block; that's the circuit breaker's job (adapter_health), not this
// adapter's.
export function createNorthDakotaAdapter(): StatePlateAdapter {
  return {
    stateCode: "ND",
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
        const body = new URLSearchParams({
          command: "",
          plateNo: normalizedPlate,
          plateStyle: PLATE_STYLE_STANDARD,
          plateSearch: "Search",
        });

        const res = await fetch(CHECK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
          signal: controller.signal,
        });
        if (!res.ok) return result("ERROR");

        const html = await res.text();
        const messageMatch = html.match(RESULT_PATTERN);
        if (!messageMatch) return result("ERROR");

        const message = messageMatch[1];
        if (/is not available/i.test(message)) return result("TAKEN");
        if (/has not been issued or ordered/i.test(message)) return result("AVAILABLE");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://apps.nd.gov/dot/mv/mvrenewal/plate.htm",
  };
}
