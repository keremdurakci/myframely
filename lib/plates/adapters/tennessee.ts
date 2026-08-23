import https from "node:https";
import tls from "node:tls";
import type { AvailabilityResult, StatePlateAdapter, StateRules } from "../types";
import { normalizePlate } from "../normalize.ts";
import { validatePlate } from "../validation.ts";

const ADAPTER_VERSION = "tennessee-v1";
const CHECK_HOST = "personalizedplates.revenue.tn.gov";
const CHECK_PATH = "/static/api/api.php";
const REQUEST_TIMEOUT_MS = 10_000;

// The standard automobile plate class ("2000") is hardcoded to this
// issueYearID in the site's own front-end bundle (a special case ahead of
// the generic /plateclass/{id}/plateclassissueyears lookup every other
// plate class uses) — not something this adapter invented.
const ISSUE_YEAR_ID_STANDARD = 3210;

// personalizedplates.revenue.tn.gov's server sends only its leaf
// certificate during the TLS handshake, omitting the DigiCert intermediate
// — browsers and curl paper over this (OS trust stores/AIA chasing fill in
// the gap), but Node's strict `fetch` doesn't, and fails with
// UNABLE_TO_VERIFY_LEAF_SIGNATURE. Discovered 2026-08-16 when live-checking
// this adapter in production (it worked from a local curl and in this
// project's earlier dev-time testing, both of which are more lenient about
// incomplete chains) — every real request from Vercel's runtime was
// silently coming back ERROR. This is the exact, correct intermediate
// (verified: `openssl verify -untrusted <this> <TN's leaf cert>` → OK),
// fetched from DigiCert's own repository at the AIA "CA Issuers" URL in
// TN's leaf cert (cacerts.digicert.com/DigiCertGlobalG2TLSRSASHA2562020CA1-1.crt).
// Supplying it explicitly completes the chain properly — this is not a
// weakening of certificate verification (verification stays fully strict;
// this is simply the certificate the server should have sent itself).
const TN_MISSING_INTERMEDIATE_CERT = `-----BEGIN CERTIFICATE-----
MIIEyDCCA7CgAwIBAgIQDPW9BitWAvR6uFAsI8zwZjANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH
MjAeFw0yMTAzMzAwMDAwMDBaFw0zMTAzMjkyMzU5NTlaMFkxCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxMzAxBgNVBAMTKkRpZ2lDZXJ0IEdsb2Jh
bCBHMiBUTFMgUlNBIFNIQTI1NiAyMDIwIENBMTCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBAMz3EGJPprtjb+2QUlbFbSd7ehJWivH0+dbn4Y+9lavyYEEV
cNsSAPonCrVXOFt9slGTcZUOakGUWzUb+nv6u8W+JDD+Vu/E832X4xT1FE3LpxDy
FuqrIvAxIhFhaZAmunjZlx/jfWardUSVc8is/+9dCopZQ+GssjoP80j812s3wWPc
3kbW20X+fSP9kOhRBx5Ro1/tSUZUfyyIxfQTnJcVPAPooTncaQwywa8WV0yUR0J8
osicfebUTVSvQpmowQTCd5zWSOTOEeAqgJnwQ3DPP3Zr0UxJqyRewg2C/Uaoq2yT
zGJSQnWS+Jr6Xl6ysGHlHx+5fwmY6D36g39HaaECAwEAAaOCAYIwggF+MBIGA1Ud
EwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFHSFgMBmx9833s+9KTeqAx2+7c0XMB8G
A1UdIwQYMBaAFE4iVCAYlebjbuYP+vq5Eu0GF485MA4GA1UdDwEB/wQEAwIBhjAd
BgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwdgYIKwYBBQUHAQEEajBoMCQG
CCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5jb20wQAYIKwYBBQUHMAKG
NGh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEdsb2JhbFJvb3RH
Mi5jcnQwQgYDVR0fBDswOTA3oDWgM4YxaHR0cDovL2NybDMuZGlnaWNlcnQuY29t
L0RpZ2lDZXJ0R2xvYmFsUm9vdEcyLmNybDA9BgNVHSAENjA0MAsGCWCGSAGG/WwC
ATAHBgVngQwBATAIBgZngQwBAgEwCAYGZ4EMAQICMAgGBmeBDAECAzANBgkqhkiG
9w0BAQsFAAOCAQEAkPFwyyiXaZd8dP3A+iZ7U6utzWX9upwGnIrXWkOH7U1MVl+t
wcW1BSAuWdH/SvWgKtiwla3JLko716f2b4gp/DA/JIS7w7d7kwcsr4drdjPtAFVS
slme5LnQ89/nD/7d+MS5EHKBCQRfz5eeLjJ1js+aWNJXMX43AYGyZm0pGrFmCW3R
bpD0ufovARTFXFZkAdl9h6g4U5+LXUZtXMYnhIHUfoyMo5tS58aI7Dd8KvvwVVo4
chDYABPPTHPbqjc1qCmBaZx2vN4Ye5DUys/vZwP9BFohFrH/6j/f3IL16/RZkiMN
JCqVJUzKoZHm1Lesh3Sz8W2jmdv51b2EQJ8HmA==
-----END CERTIFICATE-----`;

// Node's default root store plus the one missing intermediate above —
// still fully strict verification, just a complete chain to check against.
const CA_BUNDLE = [...tls.rootCertificates, TN_MISSING_INTERMEDIATE_CERT];

function postWithCompleteChain(path: string, body: string, timeoutMs: number): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: CHECK_HOST,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
        ca: CA_BUNDLE,
        timeout: timeoutMs,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString("utf8");
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text: data }));
      }
    );
    req.on("timeout", () => req.destroy(new Error("request timed out")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

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

      try {
        const realEndpoint = `/inventory/v2/personalizedplates/verifyplate/${encodeURIComponent(normalizedPlate)}/${ISSUE_YEAR_ID_STANDARD}`;
        const body = new URLSearchParams({
          "send[endpoint]": realEndpoint,
          "send[type]": "GET",
        });

        const res = await postWithCompleteChain(CHECK_PATH, body.toString(), REQUEST_TIMEOUT_MS);

        if (res.status === 200) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(res.text);
          } catch {
            return result("ERROR");
          }
          return parsed === "Plate Verified Successfully" ? result("AVAILABLE") : result("UNKNOWN");
        }

        if (res.status === 400) {
          let parsed: { type?: string; detail?: string };
          try {
            parsed = JSON.parse(res.text);
          } catch {
            return result("ERROR");
          }
          const isTaken = parsed.type === "rule-violated" && /still active/i.test(parsed.detail ?? "");
          return isTaken ? result("TAKEN") : result("UNKNOWN");
        }

        return result("ERROR");
      } catch {
        return result("ERROR");
      }
    },
    getOfficialUrl: () => "https://personalizedplates.revenue.tn.gov/",
  };
}
