import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "maine-v1";
const SELECT_TYPE_URL = "https://apps1.web.maine.gov/cgi-bin/online/bmv/vanity/select_type";
const PLATE_SEARCH_URL = "https://apps1.web.maine.gov/cgi-bin/online/bmv/vanity/plate_search";
const REQUEST_TIMEOUT_MS = 10_000;

// Standard passenger plate — not any of the ~60 other special-interest
// class codes (Agriculture, Lighthouse Trust, Lobster, ...) this same
// tool also covers.
const PLATE_TYPE_STANDARD = "Passenger";
const CLASS_CODE_STANDARD = "PC";

const TOKEN_PATTERN = /name="informepagetoken" value="([^"]+)"/;
const RESULT_PATTERN = /<p>(?:Sorry, )?Plate Number:[\s\S]*?<\/p>/i;

// Talks to the Maine BMV's own public "Vanity Plate Search & Order Online
// Service" (apps1.web.maine.gov/online/bmv/vanity) — the page's own text
// says "It is free to search the system for vanity plate availability."
// (fees only apply to actually ordering one). Verified by reproducing the
// real 2-step flow from a cold session with no prior browser visit: POST
// select_type (plate_type=Passenger) returns a `vanity_plates` session
// cookie plus a per-session informepagetoken; POST plate_search (that
// cookie, that token, class_code=PC) returns the real result — got both a
// taken ("LOVE" -> "Sorry, Plate Number: LOVE ... is unavailable.") and an
// available ("QZXK37" -> "Plate Number: QZXK37 ... is available at this
// time.") response back. No CAPTCHA, no login. apps1.web.maine.gov's
// robots.txt only disallows the rapid-renewal admin panels and
// /nei-sos-icrs/ — nothing under /cgi-bin/online/bmv/vanity.
//
// Anything other than the two known result phrases — different wording,
// non-200 status, a missing cookie or token, no matching result block, a
// network failure or timeout — is reported as ERROR and left there. This
// function never retries and never tries to work around a block; that's
// the circuit breaker's job (adapter_health), not this adapter's.
export function createMaineAdapter(): StatePlateAdapter {
  return {
    stateCode: "ME",
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
        const selectBody = new URLSearchParams({
          plate_type: PLATE_TYPE_STANDARD,
          step: "begin",
          option: "GO",
        });
        const selectRes = await fetch(SELECT_TYPE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: selectBody.toString(),
          signal: controller.signal,
        });
        if (!selectRes.ok) return result("ERROR");

        const selectHtml = await selectRes.text();
        const tokenMatch = selectHtml.match(TOKEN_PATTERN);
        if (!tokenMatch) return result("ERROR");

        const cookies =
          typeof selectRes.headers.getSetCookie === "function"
            ? selectRes.headers.getSetCookie()
            : [selectRes.headers.get("set-cookie")].filter((c): c is string => Boolean(c));
        if (cookies.length === 0) return result("ERROR");
        const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

        const searchBody = new URLSearchParams({
          plate_number: normalizedPlate,
          class_code: CLASS_CODE_STANDARD,
          transaction_id: "",
          order_number: "",
          edit_on: "",
          plate_type: PLATE_TYPE_STANDARD,
          informepagetoken: tokenMatch[1],
          submit: "Search",
        });
        const searchRes = await fetch(PLATE_SEARCH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieHeader,
          },
          body: searchBody.toString(),
          signal: controller.signal,
        });
        if (!searchRes.ok) return result("ERROR");

        const resultHtml = await searchRes.text();
        const resultMatch = resultHtml.match(RESULT_PATTERN);
        if (!resultMatch) return result("ERROR");

        const message = resultMatch[0];
        if (/is\s*<span class="error">unavailable<\/span>/i.test(message)) return result("TAKEN");
        if (/is available at this time/i.test(message)) return result("AVAILABLE");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://apps1.web.maine.gov/online/bmv/vanity/index.html",
  };
}
