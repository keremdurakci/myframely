import assert from "node:assert/strict";
import test from "node:test";
import { createWestVirginiaAdapter } from "../lib/plates/adapters/westVirginia.ts";

// These mock fetch — no real network calls in the test suite. The adapter
// was verified against the live endpoint by hand (captured a real browser
// request + confirmed the same result via a stateless curl call, see
// Phase 1 step 7 notes), not re-verified here on every test run.
function mockFetch(handler: () => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => handler()) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

test("maps the real 'Available' response to AVAILABLE, source live", async () => {
  const restore = mockFetch(
    () => new Response(JSON.stringify("Available"), { status: 200, headers: { "content-type": "application/json" } })
  );
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("QZXK372");
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "west-virginia-v1");
  } finally {
    restore();
  }
});

test("maps the real 'Not Available' response to TAKEN", async () => {
  const restore = mockFetch(
    () => new Response(JSON.stringify("Not Available"), { status: 200, headers: { "content-type": "application/json" } })
  );
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
  } finally {
    restore();
  }
});

test("an unrecognized JSON body maps to UNKNOWN, not a crash", async () => {
  const restore = mockFetch(
    () => new Response(JSON.stringify("Something New"), { status: 200, headers: { "content-type": "application/json" } })
  );
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-200 response maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => new Response("", { status: 500 }));
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-JSON response (e.g. an HTML block/login page) maps to ERROR, never parsed as data", async () => {
  const restore = mockFetch(
    () => new Response("<html>login required</html>", { status: 200, headers: { "content-type": "text/html" } })
  );
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a network failure maps to ERROR instead of throwing", async () => {
  const restore = mockFetch(() => {
    throw new Error("network down");
  });
  try {
    const adapter = createWestVirginiaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real WV search tool", () => {
  const adapter = createWestVirginiaAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://apps.wv.gov/DMV/SelfService/PersonalizedPlate/Search");
});
