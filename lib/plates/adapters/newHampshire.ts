import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "new-hampshire-v1";
const CHECK_URL = "https://business.nh.gov/Platecheck/platecheck.aspx";
const REQUEST_TIMEOUT_MS = 10_000;

// Standard passenger plate ("IPASS") — not any of the ~25 other
// special-interest/motorcycle/commercial/trailer codes this same tool also
// covers. Each sub-type has its own server-enforced max length; IPASS's is 7.
const PLATE_TYPE_STANDARD = "PASS";
const SPECIFIC_TYPE_STANDARD = "IPASS";
const LENGTH_STANDARD = "7";
const UNUSED_DROPDOWN_PLACEHOLDER = "-- Select Passenger Plate Type --";

const VIEWSTATE_PATTERN = /id="__VIEWSTATE" value="([^"]*)"/;
const VIEWSTATEGENERATOR_PATTERN = /id="__VIEWSTATEGENERATOR" value="([^"]*)"/;
const EVENTVALIDATION_PATTERN = /id="__EVENTVALIDATION" value="([^"]*)"/;

// Talks to New Hampshire's own public "Plate Check" tool
// (business.nh.gov/Platecheck) — a classic ASP.NET WebForms page. Verified
// with a cookie-less GET-then-POST: GET the page fresh for a __VIEWSTATE/
// __EVENTVALIDATION pair (no session, no cookie ever issued — confirmed via
// a request with credentials omitted entirely), then POST those tokens back
// with the plate fields. Confirmed live directly (not just taking a prior
// summary at face value — an initial implementation based on a paraphrased
// response turned out subtly wrong, see below): "LOVE" -> the ErrorLabel
// span (style="display:inline;") contains a nested <font color="Red"> tag
// wrapping "LOVE is not available!"; a random string -> ResultsDisplay
// switches from display:none to display:inline with "Your selection is
// available" inside. No CAPTCHA/session/rate-limit hit across many direct
// POSTs. business.nh.gov has no robots.txt at all (every path, including
// /robots.txt itself, redirects to the nh.gov homepage — a generic
// catch-all, not a disallow).
//
// One real gotcha: the hidden `JSTest` field is checked for presence, not
// value — omit it and the server silently no-ops (returns the blank reset
// form, no error, no result) instead of running the check. Always send it.
//
// Anything other than the two known result phrases — a validation error
// (e.g. a blacklisted combo like "H8"), non-200 status, missing tokens, no
// matching result block, a network failure or timeout — is reported as
// ERROR/UNKNOWN and left there. This function never retries and never
// tries to work around a block; that's the circuit breaker's job
// (adapter_health), not this adapter's.
export function createNewHampshireAdapter(): StatePlateAdapter {
  return {
    stateCode: "NH",
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
        const getRes = await fetch(CHECK_URL, { signal: controller.signal });
        if (!getRes.ok) return result("ERROR");

        const getHtml = await getRes.text();
        const viewState = getHtml.match(VIEWSTATE_PATTERN)?.[1];
        const viewStateGenerator = getHtml.match(VIEWSTATEGENERATOR_PATTERN)?.[1];
        const eventValidation = getHtml.match(EVENTVALIDATION_PATTERN)?.[1];
        if (viewState === undefined || viewStateGenerator === undefined || eventValidation === undefined) {
          return result("ERROR");
        }

        const postBody = new URLSearchParams({
          __EVENTTARGET: "",
          __EVENTARGUMENT: "",
          __VIEWSTATE: viewState,
          __VIEWSTATEGENERATOR: viewStateGenerator,
          __EVENTVALIDATION: eventValidation,
          "ctl00$cphMain$PlateTypeHiddenField": PLATE_TYPE_STANDARD,
          "ctl00$cphMain$SpecificTypeHiddenField": SPECIFIC_TYPE_STANDARD,
          "ctl00$cphMain$LengthHiddenField": LENGTH_STANDARD,
          "ctl00$cphMain$PlateField": PLATE_TYPE_STANDARD,
          "ctl00$cphMain$PassengerPlatesField": SPECIFIC_TYPE_STANDARD,
          "ctl00$cphMain$MotorcyclePlatesField": UNUSED_DROPDOWN_PLACEHOLDER,
          "ctl00$cphMain$CommercialPlatesField": UNUSED_DROPDOWN_PLACEHOLDER,
          "ctl00$cphMain$TrailerPlatesField": UNUSED_DROPDOWN_PLACEHOLDER,
          "ctl00$cphMain$PlateRequestField": normalizedPlate,
          "ctl00$cphMain$JSTest": "1",
          "ctl00$cphMain$SubmitCommand": "Submit",
        });

        const postRes = await fetch(CHECK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: postBody.toString(),
          signal: controller.signal,
        });
        if (!postRes.ok) return result("ERROR");

        const postHtml = await postRes.text();
        // The error span's text is wrapped in a <font> tag ("...ErrorLabel"
        // style="display:inline;"><font color="Red">LOVE is not
        // available!</font>"), so the "is shown" check and the "says taken"
        // check are done independently rather than as one adjacent-text
        // regex — the former alone is what distinguishes "an error is
        // showing" (taken, or some other validation error) from "the
        // results panel is showing" (available).
        if (/id="ctl00_cphMain_ResultsDisplay"[^>]*display:inline/i.test(postHtml)) return result("AVAILABLE");
        const errorShown = /id="ctl00_cphMain_ErrorLabel"[^>]*display:inline/i.test(postHtml);
        if (errorShown && /is not available!/i.test(postHtml)) return result("TAKEN");
        if (errorShown) return result("UNKNOWN");
        return result("ERROR");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://business.nh.gov/Platecheck/",
  };
}
