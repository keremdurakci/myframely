import assert from "node:assert/strict";
import test from "node:test";
import { createKansasAdapter } from "../lib/plates/adapters/kansas.ts";

// Real HTML fragments captured from kdor.ks.gov, trimmed to what the
// adapter actually parses — see Phase 1 recon notes for the full captures.
const GET_PAGE_HTML = `
<form action="/Apps/MotorVehicles" method="post">
<input name="__RequestVerificationToken" type="hidden" value="TEST_TOKEN_VALUE" />
</form>
`;
const TAKEN_RESULT_HTML = `
<div class="errorlist">
  <h2 class="HeaderMessage" style="color:red;font-size:large;font-weight:lighter">Plate <span style="color:blue">LOVE</span> is unavailable.</h2>
</div>
`;
const AVAILABLE_RESULT_HTML = `
<div class="errorlist">
  <h2 class="HeaderMessage" style="color:red;font-size:large;font-weight:lighter">Plate <span style="color:blue">QZXK372</span> has not been issued and is currently available.</h2>
</div>
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
  const headers: Record<string, string> = { "content-type": "text/html" };
  const res = new Response(body, { status: 200, headers });
  if (setCookie) {
    // Response built-ins don't let us attach multiple raw Set-Cookie
    // headers easily, so we monkeypatch getSetCookie the way undici does.
    (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie = () => [setCookie];
  }
  return res;
}

test("maps the real 'unavailable' response to TAKEN", async () => {
  const restore = mockFetchSequence([
    htmlResponse(GET_PAGE_HTML, "session=abc; path=/"),
    htmlResponse(TAKEN_RESULT_HTML),
  ]);
  try {
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "kansas-v1");
  } finally {
    restore();
  }
});

test("maps the real 'has not been issued and is currently available' response to AVAILABLE", async () => {
  const restore = mockFetchSequence([
    htmlResponse(GET_PAGE_HTML, "session=abc; path=/"),
    htmlResponse(AVAILABLE_RESULT_HTML),
  ]);
  try {
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("QZXK372");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    restore();
  }
});

test("a missing anti-forgery token on the GET maps to ERROR, not a crash", async () => {
  const restore = mockFetchSequence([htmlResponse("<html>no token here</html>", "session=abc; path=/")]);
  try {
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a GET with no cookie set maps to ERROR rather than posting without one", async () => {
  const restore = mockFetchSequence([htmlResponse(GET_PAGE_HTML)]);
  try {
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("an unrecognized result message maps to UNKNOWN", async () => {
  const restore = mockFetchSequence([
    htmlResponse(GET_PAGE_HTML, "session=abc; path=/"),
    htmlResponse('<h2 class="HeaderMessage">Something changed on their end</h2>'),
  ]);
  try {
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-200 on the POST step maps to ERROR", async () => {
  const restore = mockFetchSequence([
    htmlResponse(GET_PAGE_HTML, "session=abc; path=/"),
    new Response("", { status: 500 }),
  ]);
  try {
    const adapter = createKansasAdapter();
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
    const adapter = createKansasAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("getOfficialUrl points at the real KDOR tool", () => {
  const adapter = createKansasAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://www.kdor.ks.gov/Apps/MotorVehicles");
});
