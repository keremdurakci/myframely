import assert from "node:assert/strict";
import test from "node:test";
import { createMissouriAdapter } from "../lib/plates/adapters/missouri.ts";

// Real fragments captured from sa.dor.mo.gov/mv/plates4u/available across
// its 5-step GET+POST chain (plate type -> vehicle type -> View -> Check
// Availability) — see missouri.ts for the full recon writeup.
function hiddenFields(tag: string) {
  return `
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="VS-${tag}" />
<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="885B43E6" />
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="EV-${tag}" />
`;
}

const GET_HTML = `${hiddenFields("get")}<input name="ctl00$MainContent$Let1" id="MainContent_Let1" />`;
const STEP2_HTML = `${hiddenFields("step2")}<select id="MainContent_ddlSelectVehicleType"></select>`;
const STEP3_HTML = `${hiddenFields("step3")}<input name="ctl00$MainContent$Let1" id="MainContent_Let1" />`;
const STEP4_HTML = `${hiddenFields("step4")}<img id="MainContent_Image1" />`;

function takenStep5() {
  return `${hiddenFields("step5")}<span id="MainContent_lblAvailability" style="color:#CF000F;font-size:Large;font-weight:bold;">This Plate Configuration is NOT Available.  Please type in a new Plate Configuration.</span>`;
}

function availableStep5() {
  return `${hiddenFields("step5")}<span id="MainContent_lblAvailability" style="color:#CF000F;font-size:Large;font-weight:bold;">This Plate Configuration is Available.</span>`;
}

function invalidStep5() {
  return `${hiddenFields("step5")}<div>no lblAvailability rendered, no preview images</div>`;
}

function mockChain(step5Html: string) {
  const pages = [GET_HTML, STEP2_HTML, STEP3_HTML, STEP4_HTML, step5Html];
  let call = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    const body = pages[call] ?? pages[pages.length - 1];
    call++;
    return new Response(body, { status: 200, headers: { "content-type": "text/html" } });
  }) as typeof fetch;
  return {
    callCount: () => call,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

test("maps the real 'NOT Available' response to TAKEN", async () => {
  const mock = mockChain(takenStep5());
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "missouri-v1");
    assert.equal(mock.callCount(), 5);
  } finally {
    mock.restore();
  }
});

test("maps the real 'is Available.' response to AVAILABLE", async () => {
  const mock = mockChain(availableStep5());
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("BWXVKJ");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    mock.restore();
  }
});

test("a response with no lblAvailability span (invalid combo) maps to UNKNOWN, not TAKEN", async () => {
  const mock = mockChain(invalidStep5());
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("@#");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    mock.restore();
  }
});

test("a ViewState MAC failure (HTTP 500) at any step maps to ERROR, not thrown", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response("", { status: 500 })) as typeof fetch;
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("a GET missing the WebForms tokens maps to ERROR, not thrown", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response("<html>no tokens</html>", { status: 200 })) as typeof fetch;
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("a network failure maps to ERROR instead of throwing", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  try {
    const adapter = createMissouriAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("getOfficialUrl points at the real MO plate check tool", () => {
  const adapter = createMissouriAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://sa.dor.mo.gov/mv/plates4u/available");
});
