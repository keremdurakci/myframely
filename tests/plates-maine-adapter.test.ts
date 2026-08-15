import assert from "node:assert/strict";
import test from "node:test";
import { createMaineAdapter } from "../lib/plates/adapters/maine.ts";

// Real HTML fragments captured from apps1.web.maine.gov, trimmed to what
// the adapter actually parses — see Phase 1 recon notes for the full captures.
const SELECT_TYPE_HTML = `
<form action="/cgi-bin/online/bmv/vanity/plate_search" method="post">
<input type="hidden" name="informepagetoken" value="TEST_TOKEN_VALUE" />
</form>
`;
const TAKEN_RESULT_HTML = `
<p>Sorry, Plate Number: <strong>LOVE</strong> with class code <strong>Passenger (Passenger) </strong>is <span class="error">unavailable</span>. Please try another selection.</p>
`;
const AVAILABLE_RESULT_HTML = `
<p>Plate Number: <strong>QZXK37</strong> with class code <strong>Passenger (Passenger) </strong>is available at this time. An image of the plate is shown below. </p>
`;

function mockFetchSequence(responses: Response[]) {
  const original = globalThis.fetch;
  let call = 0;
  globalThis.fetch = (async () => responses[call++]) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function htmlResponse(body: string, setCookie?: string) {
  const res = new Response(body, { status: 200, headers: { "content-type": "text/html" } });
  if (setCookie) {
    (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie = () => [setCookie];
  }
  return res;
}

test("maps the real 'is unavailable' response to TAKEN", async () => {
  const restore = mockFetchSequence([
    htmlResponse(SELECT_TYPE_HTML, "vanity_plates=abc123; path=/cgi-bin/online/bmv/vanity"),
    htmlResponse(TAKEN_RESULT_HTML),
  ]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "maine-v1");
  } finally {
    restore();
  }
});

test("maps the real 'is available at this time' response to AVAILABLE", async () => {
  const restore = mockFetchSequence([
    htmlResponse(SELECT_TYPE_HTML, "vanity_plates=abc123; path=/cgi-bin/online/bmv/vanity"),
    htmlResponse(AVAILABLE_RESULT_HTML),
  ]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("QZXK37");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    restore();
  }
});

test("a missing informepagetoken on the first step maps to ERROR, not a crash", async () => {
  const restore = mockFetchSequence([
    htmlResponse("<html>no token here</html>", "vanity_plates=abc123; path=/cgi-bin/online/bmv/vanity"),
  ]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a first step with no cookie set maps to ERROR rather than searching without one", async () => {
  const restore = mockFetchSequence([htmlResponse(SELECT_TYPE_HTML)]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("an unrecognized result message maps to UNKNOWN", async () => {
  const restore = mockFetchSequence([
    htmlResponse(SELECT_TYPE_HTML, "vanity_plates=abc123; path=/cgi-bin/online/bmv/vanity"),
    htmlResponse("<p>Plate Number: <strong>X</strong> something changed on their end.</p>"),
  ]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-200 on the search step maps to ERROR", async () => {
  const restore = mockFetchSequence([
    htmlResponse(SELECT_TYPE_HTML, "vanity_plates=abc123; path=/cgi-bin/online/bmv/vanity"),
    new Response("", { status: 500 }),
  ]);
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a network failure maps to ERROR instead of throwing", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  try {
    const adapter = createMaineAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("getOfficialUrl points at the real Maine BMV vanity plate tool", () => {
  const adapter = createMaineAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://apps1.web.maine.gov/online/bmv/vanity/index.html");
});
