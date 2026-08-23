import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import https from "node:https";
import { createTennesseeAdapter } from "../lib/plates/adapters/tennessee.ts";

// Real bodies captured from personalizedplates.revenue.tn.gov's static/api/api.php
// relay — see Phase 1 recon notes for the full captures.
function problemBody(detail: string) {
  return JSON.stringify({ type: "rule-violated", title: "Rule violated", status: 400, detail });
}

function verifiedBody() {
  return JSON.stringify("Plate Verified Successfully");
}

// The adapter talks to personalizedplates.revenue.tn.gov via node:https directly
// (not global fetch) so it can supply the missing DigiCert intermediate cert that
// server's handshake omits — see tennessee.ts for why. That means these tests mock
// https.request itself rather than globalThis.fetch, unlike this project's other
// adapter tests.
function mockHttpsRequest(handler: () => { status: number; text: string } | Error) {
  const original = https.request;
  (https as unknown as { request: typeof https.request }).request = ((
    _options: unknown,
    callback: (res: EventEmitter & { statusCode: number }) => void
  ) => {
    const req = new EventEmitter() as EventEmitter & {
      write: (chunk: string) => boolean;
      end: () => void;
      destroy: () => void;
    };
    req.write = () => true;
    req.end = () => {
      queueMicrotask(() => {
        const outcome = handler();
        if (outcome instanceof Error) {
          req.emit("error", outcome);
          return;
        }
        const res = new EventEmitter() as EventEmitter & { statusCode: number };
        res.statusCode = outcome.status;
        callback(res);
        queueMicrotask(() => {
          res.emit("data", Buffer.from(outcome.text));
          res.emit("end");
        });
      });
    };
    req.destroy = () => {};
    return req;
  }) as typeof https.request;

  return () => {
    (https as unknown as { request: typeof https.request }).request = original;
  };
}

test("maps the real 'Plate Verified Successfully' response to AVAILABLE", async () => {
  const restore = mockHttpsRequest(() => ({ status: 200, text: verifiedBody() }));
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
  const restore = mockHttpsRequest(() => ({
    status: 400,
    text: problemBody("plate number: LOVE still active for 624 days"),
  }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
  } finally {
    restore();
  }
});

test("a rule violation that isn't about the plate being taken (e.g. a format error) maps to UNKNOWN, not TAKEN", async () => {
  const restore = mockHttpsRequest(() => ({
    status: 400,
    text: problemBody("max characters for format of modelID: 3210 is 7"),
  }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("an unrecognized 200 body maps to UNKNOWN, not AVAILABLE", async () => {
  const restore = mockHttpsRequest(() => ({ status: 200, text: JSON.stringify("Something New") }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a non-JSON body on a 200 maps to ERROR, not thrown", async () => {
  const restore = mockHttpsRequest(() => ({ status: 200, text: "<html>" }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-JSON body on a 400 maps to ERROR, not thrown", async () => {
  const restore = mockHttpsRequest(() => ({ status: 400, text: "<html>" }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("an unexpected status (e.g. 500) maps to ERROR", async () => {
  const restore = mockHttpsRequest(() => ({ status: 500, text: "" }));
  try {
    const adapter = createTennesseeAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a network failure maps to ERROR instead of throwing", async () => {
  const restore = mockHttpsRequest(() => new Error("network down"));
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
