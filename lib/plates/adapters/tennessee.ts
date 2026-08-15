import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "tennessee-v1";
const CHECK_URL = "https://personalizedplates.revenue.tn.gov/static/api/api.php";
const REQUEST_TIMEOUT_MS = 10_000;

// The standard automobile plate class ("2000") is hardcoded to this
// issueYearID in the site's own front-end bundle (a special case ahead of
// the generic /plateclass/{id}/plateclassissueyears lookup every other
// plate class uses) — not something this adapter invented.
const ISSUE_YEAR_ID_STANDARD = 3210;

// The site (personalizedplates.revenue.tn.gov) is a Vue SPA — there's no
// endpoint visible in the static HTML. Found by downloading its own JS
// bundle (static/js/app.*.js) and tracing checkPlate1/2/3: the browser
// never calls the real backend directly. It POSTs to a same-origin PHP
// relay, static/api/api.php, with body send[endpoint]=<real path>&
// send[type]=GET, and that relay forwards to the actual API host,
// bisvtrsapi.revenue.tn.gov (see static/api/configurations/config.js:
// checkStatusAPIEndpoint). The real path for a check is
// /inventory/v2/personalizedplates/verifyplate/<PLATE>/<issueYearID>.
//
// Verified by calling the relay directly, cold, with no prior page visit
// and no cookie: LOVE -> HTTP 400 application/problem+json
// {"type":"rule-violated","detail":"plate number: LOVE still active for
// 624 days"}; QZXK372 -> HTTP 200 "Plate Verified Successfully" (a JSON
// string). No CAPTCHA, no login, no session priming — a single stateless
// POST is the whole exchange. robots.txt is a 404 on
// personalizedplates.revenue.tn.gov and a 501 (not implemented) on
// bisvtrsapi.revenue.tn.gov — no crawl restriction on either host.
//
// Status 400 isn't unique to "taken": an invalid plate (tried "!!!!!!!!")
// comes back the same status and the same "rule-violated" type, but with
// a different detail ("max characters for format... is 7"). So a 400 only
// maps to TAKEN when the detail text specifically says the plate is still
// active; every other 400 detail — and anything on a 200 other than the
// exact "Plate Verified Successfully" string — maps to UNKNOWN, not
// TAKEN/AVAILABLE. Anything that isn't parseable JSON on a 200/400, any
// other status, or a network failure maps to ERROR. This function never
// retries and never tries to work around a block; that's the circuit
// breaker's job (adapter_health), not this adapter's.
export function createTennesseeAdapter(): StatePlateAdapter {
  return {
    stateCode: "TN",
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
        const realEndpoint = `/inventory/v2/personalizedplates/verifyplate/${encodeURIComponent(normalizedPlate)}/${ISSUE_YEAR_ID_STANDARD}`;
        const body = new URLSearchParams({
          "send[endpoint]": realEndpoint,
          "send[type]": "GET",
        });

        const res = await fetch(CHECK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
          signal: controller.signal,
        });

        if (res.status === 200) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(await res.text());
          } catch {
            return result("ERROR");
          }
          return parsed === "Plate Verified Successfully" ? result("AVAILABLE") : result("UNKNOWN");
        }

        if (res.status === 400) {
          let parsed: { type?: string; detail?: string };
          try {
            parsed = JSON.parse(await res.text());
          } catch {
            return result("ERROR");
          }
          const isTaken = parsed.type === "rule-violated" && /still active/i.test(parsed.detail ?? "");
          return isTaken ? result("TAKEN") : result("UNKNOWN");
        }

        return result("ERROR");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://personalizedplates.revenue.tn.gov/",
  };
}
