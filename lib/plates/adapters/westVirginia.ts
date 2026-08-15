import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "west-virginia-v1";
const CHECK_URL = "https://apps.wv.gov/DMV/SelfService/Api/PersonalizedPlateApi/CheckPlate";
const REQUEST_TIMEOUT_MS = 10_000;

// Talks to WV DMV's own public "Personalized Plate Search" tool — the same
// endpoint apps.wv.gov/DMV/SelfService/PersonalizedPlate/Search calls from
// the browser. Confirmed by capturing the real request: POST
// PlateNumber=<value> (application/x-www-form-urlencoded), no session
// cookie required, no CAPTCHA, no login — verified by calling it directly
// with no prior page visit and getting the same "Available" /
// "Not Available" result the browser got. Cross-checked against
// apps.wv.gov/robots.txt (explicit Allow: /DMV/SelfService) and WV.gov's
// Content Disclaimer / Legal Notices / Security Policy pages, none of which
// restrict automated read-only use (Phase 1 recon).
//
// Anything other than exactly those two response strings — different body,
// non-200 status, non-JSON content (e.g. an HTML login/CAPTCHA page), a
// network error or timeout — is reported as ERROR and left there. This
// function never retries, never inspects further, and never tries to work
// around a block; that's the circuit breaker's job (adapter_health), not
// this adapter's.
export function createWestVirginiaAdapter(): StatePlateAdapter {
  return {
    stateCode: "WV",
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
        const res = await fetch(CHECK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: `PlateNumber=${encodeURIComponent(normalizedPlate)}`,
          signal: controller.signal,
        });

        if (!res.ok) return result("ERROR");

        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) return result("ERROR");

        const body = await res.json();
        if (body === "Available") return result("AVAILABLE");
        if (body === "Not Available") return result("TAKEN");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://apps.wv.gov/DMV/SelfService/PersonalizedPlate/Search",
  };
}
