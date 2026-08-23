import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "wyoming-v1";
const SEARCH_PAGE_URL = "https://webapp.dot.state.wy.us/ao/f?p=174:12";
const AJAX_URL_BASE = "https://webapp.dot.state.wy.us/ao/wwv_flow.ajax";
const REQUEST_TIMEOUT_MS = 15_000;

// county=0 ("All Counties") and vehicle type 1 ("Passenger") — the standard
// combination for this project's single boolean AVAILABLE/TAKEN model.
// Wyoming's real tool checks availability PER COUNTY (a plate can be taken
// in some of the state's 23 counties and available in others at the same
// time) — "All Counties" mode is the one request shape that collapses this
// into something usable here: confirmed live that a partially-available
// plate renders ONLY a non-empty results list (no error text at all), and a
// plate taken in every county renders the opposite (empty results, a
// generic "not available" error) — so "available in at least one county"
// maps cleanly to this project's single AVAILABLE/TAKEN status.
const COUNTY_ALL = "0";
const VEHICLE_TYPE_PASSENGER = "1";

// Each of Wyoming's server-enforced structural rules has its own distinct
// error sentence, verified live (see the top-of-file comment) -- any of
// these appearing means the input itself was rejected, not that the
// combination is taken.
const VALIDATION_MESSAGE_PATTERNS = [
  /may only contain one to five letters and numbers/i,
  /Only Capital Letters and Arabic numbers are allowed/i,
  /more than three W's or M's is allowed/i,
  /entirely numbers is allowed unless the first number is a zero/i,
  /Plate Combination is required/i,
];

const P_INSTANCE_PATTERN = /value="([^"]*)" id="pInstance"/;
const P_SALT_PATTERN = /value="([^"]*)" id="pSalt"/;
const P_PAGE_ITEMS_PROTECTED_PATTERN = /id="pPageItemsProtected" value="([^"]*)"/;
// The Search button's Dynamic Action (fires on click while
// P12_PLATE_COMBINATION is non-empty) carries its own ajaxIdentifier,
// distinct from a couple of other Dynamic Actions on the same page —
// anchored on the condition text rather than a hardcoded button id, since
// nothing in the recon confirmed the button id is stable across deploys.
const AJAX_IDENTIFIER_PATTERN =
  /"conditionElement":"P12_PLATE_COMBINATION"[\s\S]*?"ajaxIdentifier":"([^"]+)"/;

function decodeHtmlEntities(value: string): string {
  return value.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

// ajaxIdentifier is embedded as JS source (e.g. containing / for "/"),
// not HTML — JSON.parse on a quoted wrapper decodes those escapes properly.
function decodeJsStringEscapes(value: string): string {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
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

type SessionTokens = { pInstance: string; pSalt: string; pPageItemsProtected: string; ajaxIdentifier: string };

function extractTokens(html: string): SessionTokens | undefined {
  const pInstance = html.match(P_INSTANCE_PATTERN)?.[1];
  const pSalt = html.match(P_SALT_PATTERN)?.[1];
  const pPageItemsProtectedRaw = html.match(P_PAGE_ITEMS_PROTECTED_PATTERN)?.[1];
  const ajaxIdentifierRaw = html.match(AJAX_IDENTIFIER_PATTERN)?.[1];
  if (!pInstance || !pSalt || !pPageItemsProtectedRaw || !ajaxIdentifierRaw) return undefined;
  return {
    pInstance,
    pSalt,
    pPageItemsProtected: decodeHtmlEntities(pPageItemsProtectedRaw),
    ajaxIdentifier: decodeJsStringEscapes(ajaxIdentifierRaw),
  };
}

type ResponseItem = { id: string; value: string };

// Talks to Wyoming's real "Search Prestige" tool
// (webapp.dot.state.wy.us/ao/f?p=174:12), a completely separate Oracle APEX
// application from the wyodot.wyo.gov/dot.state.wy.us marketing pages (which
// only list a phone number) — found via the "look up availability" link on
// those pages, the same pattern as Kentucky and Washington both having their
// real tool on a different subdomain than their marketing page.
//
// This is a stateful, checksum-protected AJAX flow verified directly through
// a real browser session (not just a standalone script) after an initial
// hand-written reproduction hit a "Checksum format error" — captured the
// exact successful request Wyoming's own page issues via a patched
// XMLHttpRequest, matched it field-for-field against this implementation,
// and independently re-confirmed both outcomes live before trusting it:
//   1. GET the search page fresh -> scrape pInstance/pSalt/
//      pPageItemsProtected (a real anti-tampering checksum baked into the
//      page, not just a session id) and the Search button's ajaxIdentifier;
//      keep whatever cookies the GET sets (an APEX session + a couple of
//      F5/BIG-IP infra persistence cookies, not a bot challenge).
//   2. POST .../wwv_flow.ajax?p_context=174:12:<pInstance> with
//      p_request=PLUGIN=<ajaxIdentifier> and a p_json body whose
//      itemsToSubmit carries P12_COUNTY/P12_VEHICLE_TYPE_ID/
//      P12_PLATE_COMBINATION plus the page's "protected" checksum and
//      "salt" -- see buildRequestBody below for the exact shape.
// Response is JSON: {"item":[{"id":"P12_RESULTS","value":"..."},
// {"id":"P12_ERRORS","value":"..."}, ...]}.
//
// Verbatim, live-confirmed text (via the real page, not a paraphrase):
// available-in-at-least-one-county -> P12_RESULTS = "The plate combination
// is available in the following counties:<br><ul><li>3 - P - LOVE</li>...";
// taken-in-a-county -> P12_ERRORS = "...Error validating plate:<br>1 - P -
// LOVE<ul><li>Plate combination is not available.</li></ul></div>".
//
// Wyoming's documented rules (max 5 chars; max 3 W's or M's; all-numeric
// must start with 0; letters/numbers only) ARE server-enforced, each with
// its own distinct error sentence -- confirmed by deliberately sending
// rule-violating input straight to the endpoint, bypassing the page's own
// client-side filtering, one rule at a time: "WWWWZ" -> "No combination
// with more than three W's or M's is allowed."; "98271" -> "No combination
// of entirely numbers is allowed unless the first number is a zero.";
// "AB#CD" -> "Only Capital Letters and Arabic numbers are allowed."; a
// too-long combination -> "...may only contain one to five letters and
// numbers." A genuinely taken/reserved plate's response never contains any
// of those sentences -- only the bare "Plate combination is not
// available." with nothing else. VALIDATION_MESSAGE_PATTERNS below is
// exactly that set, checked before ever concluding TAKEN, so a
// structurally-invalid combination that slips past local validation (see
// state_configs' rules_json) is reported as UNKNOWN rather than a false
// TAKEN. (An extreme case -- an over-length plate sent in "All Counties"
// mode specifically -- makes the backend throw a raw Oracle error instead
// of a normal validation response; that comes back as a JSON shape with no
// "item" array at all, which the parsing below already falls through to
// UNKNOWN for, not a crash. Local length validation prevents a real search
// from ever reaching this case.)
export function createWyomingAdapter(): StatePlateAdapter {
  return {
    stateCode: "WY",
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

      try {
        const getRes = await fetch(SEARCH_PAGE_URL, { signal: controller.signal });
        if (!getRes.ok) return result("ERROR");
        mergeCookies(jar, getRes);
        const html = await getRes.text();
        const tokens = extractTokens(html);
        if (!tokens) return result("ERROR");

        const pJson = JSON.stringify({
          pageItems: {
            itemsToSubmit: [
              { n: "P12_RESULTS", v: "" },
              { n: "P12_ERRORS", v: "" },
              { n: "P12_COUNTY", v: COUNTY_ALL },
              { n: "P12_VEHICLE_TYPE_ID", v: VEHICLE_TYPE_PASSENGER },
              { n: "P12_PLATE_COMBINATION", v: normalizedPlate },
              { n: "P12_FIRST_COUNTY", v: "" },
            ],
            protected: tokens.pPageItemsProtected,
            rowVersion: "",
            formRegionChecksums: [],
          },
          salt: tokens.pSalt,
        });

        const body = new URLSearchParams({
          p_flow_id: "174",
          p_flow_step_id: "12",
          p_instance: tokens.pInstance,
          p_debug: "",
          p_request: `PLUGIN=${tokens.ajaxIdentifier}`,
          p_json: pJson,
        });

        const postRes = await fetch(`${AJAX_URL_BASE}?p_context=174:12:${tokens.pInstance}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            Referer: SEARCH_PAGE_URL,
            Cookie: cookieHeader(jar),
          },
          body: body.toString(),
          signal: controller.signal,
        });
        if (!postRes.ok) return result("ERROR");

        const postText = await postRes.text();
        let parsed: { item?: ResponseItem[] };
        try {
          parsed = JSON.parse(postText);
        } catch {
          return result("ERROR");
        }
        const items = parsed.item ?? [];
        const resultsValue = items.find((i) => i.id === "P12_RESULTS")?.value ?? "";
        const errorsValue = items.find((i) => i.id === "P12_ERRORS")?.value ?? "";

        if (resultsValue.includes("is available in the following counties")) return result("AVAILABLE");
        if (VALIDATION_MESSAGE_PATTERNS.some((p) => p.test(errorsValue))) return result("UNKNOWN");
        if (errorsValue.includes("Plate combination is not available")) return result("TAKEN");
        return result("UNKNOWN");
      } catch {
        return result("ERROR");
      } finally {
        clearTimeout(timeout);
      }
    },
    getOfficialUrl: () => "https://webapp.dot.state.wy.us/ao/f?p=174:12",
  };
}
