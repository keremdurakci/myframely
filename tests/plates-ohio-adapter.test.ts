import assert from "node:assert/strict";
import test from "node:test";
import { createOhioAdapter } from "../lib/plates/adapters/ohio.ts";

// Real HTML fragments captured from bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview.
const TAKEN_RESULT_HTML = `
<input id="plateValidationError" type="hidden" />
<div class="alert alert-danger" role="alert"><i class="fas fa-exclamation-circle fa-lg"></i> Please fix the following errors:<ul role='list'><li role="listitem" tabindex="0">Plate is issued.</li></ul></div>
`;
const AVAILABLE_RESULT_HTML = `
<div class="alert alert-success fw-bold" role="alert">
    <i class="fa-check-circle fas glyphicon glyphicon-ok"></i> This plate number is currently available.
</div>
`;
const INVALID_FORMAT_HTML = `
<div class="alert alert-danger" role="alert"><i class="fas fa-exclamation-circle fa-lg"></i> Please fix the following errors:<ul role='list'><li role="listitem" tabindex="0">Invalid Format.</li></ul></div>
`;
const RATE_LIMITED_HTML = `
<div class="alert alert-danger" role="alert"><i class="fas fa-exclamation-circle fa-lg"></i> Please fix the following errors:<ul role='list'><li role="listitem" tabindex="0">You have reached the maximum plate preview attempts. Please try again in 1 minute.</li></ul></div>
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

test("maps the real 'Plate is issued.' response to TAKEN", async () => {
  const restore = mockFetch(() => htmlResponse(TAKEN_RESULT_HTML));
  try {
    const adapter = createOhioAdapter();
    const result = await adapter.checkAvailability("OHIO");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "ohio-v1");
  } finally {
    restore();
  }
});

test("maps the real 'currently available' response to AVAILABLE", async () => {
  const restore = mockFetch(() => htmlResponse(AVAILABLE_RESULT_HTML));
  try {
    const adapter = createOhioAdapter();
    const result = await adapter.checkAvailability("ZQX9K7B");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    restore();
  }
});

test("an 'Invalid Format.' response maps to UNKNOWN, not a crash", async () => {
  const restore = mockFetch(() => htmlResponse(INVALID_FORMAT_HTML));
  try {
    const adapter = createOhioAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("the endpoint's own rate-limit message maps to ERROR, not a plate status", async () => {
  const restore = mockFetch(() => htmlResponse(RATE_LIMITED_HTML));
  try {
    const adapter = createOhioAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-200 response maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => htmlResponse("", 500));
  try {
    const adapter = createOhioAdapter();
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
    const adapter = createOhioAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real Ohio BMV checker page", () => {
  const adapter = createOhioAdapter();
  assert.equal(
    adapter.getOfficialUrl(),
    "https://bmvonline.dps.ohio.gov/bmvonline/oplates/specializedplates/1"
  );
});
