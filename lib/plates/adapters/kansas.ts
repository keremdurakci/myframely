import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "kansas-v1";
const BASE_URL = "https://www.kdor.ks.gov/Apps/MotorVehicles";
const REQUEST_TIMEOUT_MS = 10_000;

// Passenger vehicle type + the standard "Personalized 2025" plate type —
// not any of the ~80 specialty/military/university plate designs this same
// tool also covers.
const VEHICLE_TYPE_PASSENGER = "1";
const PLATE_TYPE_PERSONALIZED = "503";

const TOKEN_PATTERN = /__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/;
const RESULT_PATTERN = /<h2 class="HeaderMessage"[^>]*>([\s\S]*?)<\/h2>/;

// Talks to KDOR's own public "Personalized Plate Availability" tool
// (kdor.ks.gov/Apps/MotorVehicles) — verified by capturing the real browser
// form submission, then reproducing both a taken ("LOVE") and an available
// ("QZXK372") result from a cold server-side GET+POST with no prior
// browser session, getting the identical wording back both times. No
// CAPTCHA, no login. robots.txt does not disallow this path (only
// /Apps/Webservices/ and /Apps/pvdcama/ are blocked); ksrevenue.gov's
// Terms of Service has no automated-access restriction, just a standard
// accuracy disclaimer.
//
// The tool does require an ASP.NET anti-forgery token + its paired cookie
// (plus an Azure ARRAffinity session-affinity cookie) — that's ordinary web
// security hygiene applied to every form on the site, not bot detection, so
// getting and relaying it is not a CAPTCHA/login bypass. A fresh GET is
// made for every check specifically because the token is single-use/
// session-bound; nothing here works around a block, and anything other
// than the two known result phrases below is reported as ERROR untouched.
export function createKansasAdapter(): StatePlateAdapter {
  return {
    stateCode: "KS",
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
        const getRes = await fetch(BASE_URL, { method: "GET", signal: controller.signal });
        if (!getRes.ok) return result("ERROR");

        const html = await getRes.text();
        const tokenMatch = html.match(TOKEN_PATTERN);
        if (!tokenMatch) return result("ERROR");

        const cookies =
          typeof getRes.headers.getSetCookie === "function"
            ? getRes.headers.getSetCookie()
            : [getRes.headers.get("set-cookie")].filter((c): c is string => Boolean(c));
        if (cookies.length === 0) return result("ERROR");
        const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

        const body = new URLSearchParams({
          __RequestVerificationToken: tokenMatch[1],
          iVehicleType: VEHICLE_TYPE_PASSENGER,
          bDisabled: "false",
          iPlateType: PLATE_TYPE_PERSONALIZED,
          sPlateChoice: normalizedPlate,
          submit: "Submit",
        });

        const postRes = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieHeader,
          },
          body: body.toString(),
          signal: controller.signal,
        });
        if (!postRes.ok) return result("ERROR");

        const resultHtml = await postRes.text();
        const messageMatch = resultHtml.match(RESULT_PATTERN);
        if (!messageMatch) return result("ERROR");

        const message = messageMatch[1];
        if (/is currently available/i.test(message)) return result("AVAILABLE");
        if (/is unavailable/i.test(message)) return result("TAKEN");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://www.kdor.ks.gov/Apps/MotorVehicles",
  };
}
