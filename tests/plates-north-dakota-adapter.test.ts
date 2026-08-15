import assert from "node:assert/strict";
import test from "node:test";
import { createNorthDakotaAdapter } from "../lib/plates/adapters/northDakota.ts";

// Real HTML fragments captured from apps.nd.gov, trimmed to what the
// adapter actually parses — see Phase 1 recon notes for the full captures.
const TAKEN_RESULT_HTML = `
<p><strong>Plate LOVE is not available.</strong></p>
<p><strong>Special Request Plate (SRP) availability may change...</strong></p>
`;
const AVAILABLE_RESULT_HTML = `
<p><strong>Plate QZX372 has not been issued or ordered.</strong></p>
<p><strong>Special Request Plate (SRP) availability may change...</strong></p>
`;

function mockFetch(handler: () => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => handler()) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html" } });
}

test("maps the real 'is not available' response to TAKEN", async () => {
  const restore = mockFetch(() => htmlResponse(TAKEN_RESULT_HTML));
  try {
    const adapter = createNorthDakotaAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "north-dakota-v1");
  } finally {
    restore();
  }
});

test("maps the real 'has not been issued or ordered' response to AVAILABLE", async () => {
  const restore = mockFetch(() => htmlResponse(AVAILABLE_RESULT_HTML));
  try {
    const adapter = createNorthDakotaAdapter();
    const result = await adapter.checkAvailability("QZX372");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    restore();
  }
});

test("an unrecognized result message maps to UNKNOWN, not a crash", async () => {
  const restore = mockFetch(() => htmlResponse("<p><strong>Plate X something changed on their end.</strong></p>"));
  try {
    const adapter = createNorthDakotaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a missing result block maps to ERROR, not a crash", async () => {
  const restore = mockFetch(() => htmlResponse("<html>System maintenance, please try again later.</html>"));
  try {
    const adapter = createNorthDakotaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-200 response maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => htmlResponse("", 500));
  try {
    const adapter = createNorthDakotaAdapter();
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
    const adapter = createNorthDakotaAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real NDDOT search tool", () => {
  const adapter = createNorthDakotaAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://apps.nd.gov/dot/mv/mvrenewal/plate.htm");
});
