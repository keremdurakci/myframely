import assert from "node:assert/strict";
import test from "node:test";
import { createKentuckyAdapter } from "../lib/plates/adapters/kentucky.ts";

// Real bodies captured from secure.kentucky.gov/kytc/plates/web/LicensePlate/Verify.
function jsonResponse(value: string, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
}

function mockFetch(handler: () => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => handler()) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

test("maps the real 'OK' response to AVAILABLE", async () => {
  const restore = mockFetch(() => jsonResponse("OK"));
  try {
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("ZKXVJP");
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "kentucky-v1");
  } finally {
    restore();
  }
});

test("maps the real 'is not available' response to TAKEN", async () => {
  const restore = mockFetch(() => jsonResponse("Requested text: 'LOVE' is not available."));
  try {
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
  } finally {
    restore();
  }
});

test("a format-rejection message (e.g. an excluded letter) maps to UNKNOWN, not TAKEN", async () => {
  const restore = mockFetch(() => jsonResponse("Requested text: 'QZXKJH' does not match the required format."));
  try {
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("QZXKJH");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("an unrecognized JSON body maps to UNKNOWN, not a crash", async () => {
  const restore = mockFetch(() => jsonResponse("A 7 character must contain a space or dash"));
  try {
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("ABCDEFGH");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-JSON body maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => new Response("<html>", { status: 200, headers: { "content-type": "text/html" } }));
  try {
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-200 response maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => new Response("", { status: 500 }));
  try {
    const adapter = createKentuckyAdapter();
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
    const adapter = createKentuckyAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real KY plate personalization tool", () => {
  const adapter = createKentuckyAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://secure.kentucky.gov/kytc/plates/web");
});
