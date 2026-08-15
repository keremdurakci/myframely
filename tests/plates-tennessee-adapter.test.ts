import assert from "node:assert/strict";
import test from "node:test";
import { createTennesseeAdapter } from "../lib/plates/adapters/tennessee.ts";

// Real bodies captured from personalizedplates.revenue.tn.gov's static/api/api.php
// relay — see Phase 1 recon notes for the full captures.
function problemResponse(detail: string) {
  return new Response(JSON.stringify({ type: "rule-violated", title: "Rule violated", status: 400, detail }), {
    status: 400,
    headers: { "content-type": "application/problem+json" },
  });
}

function verifiedResponse() {
  return new Response(JSON.stringify("Plate Verified Successfully"), {
    status: 200,
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
}

function mockFetch(handler: () => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => handler()) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

test("maps the real 'Plate Verified Successfully' response to AVAILABLE", async () => {
  const restore = mockFetch(() => verifiedResponse());
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("QZXK372");
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "tennessee-v1");
  } finally {
    restore();
  }
});

test("maps the real 'still active' rule violation to TAKEN", async () => {
  const restore = mockFetch(() => problemResponse("plate number: LOVE still active for 624 days"));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
  } finally {
    restore();
  }
});

test("a rule violation that isn't about the plate being taken (e.g. a format error) maps to UNKNOWN, not TAKEN", async () => {
  const restore = mockFetch(() => problemResponse("max characters for format of modelID: 3210 is 7"));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("an unrecognized 200 body maps to UNKNOWN, not AVAILABLE", async () => {
  const restore = mockFetch(
    () => new Response(JSON.stringify("Something New"), { status: 200, headers: { "content-type": "text/html" } })
  );
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-JSON body on a 200 maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => new Response("<html>", { status: 200, headers: { "content-type": "text/html" } }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-JSON body on a 400 maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => new Response("<html>", { status: 400, headers: { "content-type": "text/html" } }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("an unexpected status (e.g. 500) maps to ERROR", async () => {
  const restore = mockFetch(() => new Response("", { status: 500 }));
  try {
    const adapter = createTennesseeAdapter();
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
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real TN personalized plates portal", () => {
  const adapter = createTennesseeAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://personalizedplates.revenue.tn.gov/");
});
