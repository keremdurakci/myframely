import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "missouri-v1";
const CHECK_URL = "https://sa.dor.mo.gov/mv/plates4u/available";
const REQUEST_TIMEOUT_MS = 20_000;
const LET_FIELD_COUNT = 7;

// "Regular Personalized" plate type and "Passenger" vehicle type — the
// values the site's own <select> options carry, not something guessed.
const PLATE_TYPE_REGULAR_PERSONALIZED = "8";
const VEHICLE_TYPE_PASSENGER = "82";

const VIEWSTATE_PATTERN = /id="__VIEWSTATE" value="([^"]*)"/;
const VIEWSTATEGENERATOR_PATTERN = /id="__VIEWSTATEGENERATOR" value="([^"]*)"/;
const EVENTVALIDATION_PATTERN = /id="__EVENTVALIDATION" value="([^"]*)"/;

type Hidden = { viewState: string; viewStateGenerator: string; eventValidation: string };

function extractHidden(html: string): Hidden | undefined {
  const viewState = html.match(VIEWSTATE_PATTERN)?.[1];
  const viewStateGenerator = html.match(VIEWSTATEGENERATOR_PATTERN)?.[1];
  const eventValidation = html.match(EVENTVALIDATION_PATTERN)?.[1];
  if (viewState === undefined || viewStateGenerator === undefined || eventValidation === undefined) return undefined;
  return { viewState, viewStateGenerator, eventValidation };
}

function mergeCookies(jar: Map<string, string>, res: Response): void {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const raw of setCookies) {
    const pair = raw.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1));
  }
}

function cookieHeader(jar: Map<string, string>): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function toLetterFields(plate: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (let i = 0; i < LET_FIELD_COUNT; i++) {
    fields[`ctl00$MainContent$Let${i + 1}`] = plate[i] ?? "";
  }
  return fields;
}

// The site (sa.dor.mo.gov/mv/plates4u/available, classic ASP.NET WebForms
// behind an Incapsula/Imperva WAF) is stateful, unlike this project's other
// adapters — a cookie-less GET-then-POST fails hard with an HTTP 500
// "Validation of viewstate MAC failed" error, because ViewState MAC
// validation is bound to the server-side session. Confirmed directly (not
// just taking a research pass's summary at face value — see the project's
// standing practice of independently re-verifying live before writing the
// parser): a real Incapsula session cookie picked up from the initial GET
// must be carried through every subsequent POST in the chain below.
//
// The full chain, each step's hidden ViewState/EventValidation tokens
// feeding the next, same cookie jar throughout:
//   1. GET  -> scrape hidden tokens (plate-type dropdown + Let1-7 boxes are
//      already present in this response; the vehicle-type dropdown is not
//      -- it only renders after step 2's postback).
//   2. POST __EVENTTARGET=ddlSelectPlateType, plate type=8 (Regular
//      Personalized) -> response now contains the vehicle-type dropdown.
//   3. POST __EVENTTARGET=ddlSelectVehicleType, vehicle type=82 (Passenger)
//      -> response confirms Let1-7 + enables the View/Clear buttons.
//   4. POST __EVENTTARGET blank, Let1-7=<plate>, btnView=View -> renders the
//      plate preview and enables Check Availability. Verified this step is
//      not optional: skipping straight to step 5 with new letters but an
//      older View'd viewstate silently re-checks the previous plate string
//      (confirmed by watching the preview <img> alt text lag behind), not
//      the new one -- so step 4 must always run immediately before step 5
//      with the exact same letters.
//   5. POST __EVENTTARGET=btnAvailable, Let1-7=<plate> (repeated) -> the
//      response contains the real verdict in id="MainContent_lblAvailability".
//
// Verdict text (confirmed live, both directions use the identical CSS
// color so only the text distinguishes them): "...is NOT Available.  Please
// type in a new Plate Configuration." (double space, confirmed via a
// char-code dump) -> TAKEN; "...is Available." -> AVAILABLE. An invalid
// combination (e.g. disallowed punctuation) renders neither
// lblAvailability nor any preview <img> at all -- a third, distinct state
// mapped to UNKNOWN, not silently treated as available or taken.
//
// sa.dor.mo.gov/robots.txt is a 404 -- no crawl restriction. No CAPTCHA
// surfaced across a real check-submission (confirmed by direct testing,
// not just page inspection), though Incapsula could still rate-limit or
// challenge under heavier automated volume than this adapter's own
// traffic generates -- any such block would come back as a non-200 or a
// response missing the expected fields, both of which already map to
// ERROR/UNKNOWN here, not retried inline. That's the circuit breaker's
// job (adapter_health), not this adapter's.
export function createMissouriAdapter(): StatePlateAdapter {
  return {
    stateCode: "MO",
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

      const jar = new Map<string, string>();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const request = async (body?: URLSearchParams): Promise<{ ok: boolean; text: string }> => {
        const res = await fetch(CHECK_URL, {
          method: body ? "POST" : "GET",
          headers: {
            ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
            Cookie: cookieHeader(jar),
          },
          body: body?.toString(),
          signal: controller.signal,
        });
        mergeCookies(jar, res);
        return { ok: res.ok, text: await res.text() };
      };

      try {
        const getRes = await request();
        if (!getRes.ok) return result("ERROR");
        let hidden = extractHidden(getRes.text);
        if (!hidden) return result("ERROR");

        const step2 = await request(
          new URLSearchParams({
            __EVENTTARGET: "ctl00$MainContent$ddlSelectPlateType",
            __EVENTARGUMENT: "",
            __VIEWSTATE: hidden.viewState,
            __VIEWSTATEGENERATOR: hidden.viewStateGenerator,
            __EVENTVALIDATION: hidden.eventValidation,
            "ctl00$MainContent$ddlSelectPlateType": PLATE_TYPE_REGULAR_PERSONALIZED,
          })
        );
        if (!step2.ok) return result("ERROR");
        hidden = extractHidden(step2.text);
        if (!hidden) return result("ERROR");

        const step3 = await request(
          new URLSearchParams({
            __EVENTTARGET: "ctl00$MainContent$ddlSelectVehicleType",
            __EVENTARGUMENT: "",
            __VIEWSTATE: hidden.viewState,
            __VIEWSTATEGENERATOR: hidden.viewStateGenerator,
            __EVENTVALIDATION: hidden.eventValidation,
            "ctl00$MainContent$ddlSelectPlateType": PLATE_TYPE_REGULAR_PERSONALIZED,
            "ctl00$MainContent$ddlSelectVehicleType": VEHICLE_TYPE_PASSENGER,
          })
        );
        if (!step3.ok) return result("ERROR");
        hidden = extractHidden(step3.text);
        if (!hidden) return result("ERROR");

        const letterFields = toLetterFields(normalizedPlate);

        const step4 = await request(
          new URLSearchParams({
            __EVENTTARGET: "",
            __EVENTARGUMENT: "",
            __VIEWSTATE: hidden.viewState,
            __VIEWSTATEGENERATOR: hidden.viewStateGenerator,
            __EVENTVALIDATION: hidden.eventValidation,
            "ctl00$MainContent$ddlSelectPlateType": PLATE_TYPE_REGULAR_PERSONALIZED,
            "ctl00$MainContent$ddlSelectVehicleType": VEHICLE_TYPE_PASSENGER,
            ...letterFields,
            "ctl00$MainContent$btnView": "View",
          })
        );
        if (!step4.ok) return result("ERROR");
        hidden = extractHidden(step4.text);
        if (!hidden) return result("ERROR");

        const step5 = await request(
          new URLSearchParams({
            __EVENTTARGET: "ctl00$MainContent$btnAvailable",
            __EVENTARGUMENT: "",
            __VIEWSTATE: hidden.viewState,
            __VIEWSTATEGENERATOR: hidden.viewStateGenerator,
            __EVENTVALIDATION: hidden.eventValidation,
            "ctl00$MainContent$ddlSelectPlateType": PLATE_TYPE_REGULAR_PERSONALIZED,
            "ctl00$MainContent$ddlSelectVehicleType": VEHICLE_TYPE_PASSENGER,
            ...letterFields,
          })
        );
        if (!step5.ok) return result("ERROR");

        if (!step5.text.includes('id="MainContent_lblAvailability"')) return result("UNKNOWN");
        if (/is NOT Available/i.test(step5.text)) return result("TAKEN");
        if (/is Available\./i.test(step5.text)) return result("AVAILABLE");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://sa.dor.mo.gov/mv/plates4u/available",
  };
}
