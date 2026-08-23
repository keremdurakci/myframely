import assert from "node:assert/strict";
import test from "node:test";
import { createNewHampshireAdapter } from "../lib/plates/adapters/newHampshire.ts";

// Real fragments captured from business.nh.gov/Platecheck/platecheck.aspx.
const GET_PAGE_HTML = `
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="ABC123VIEWSTATE" />
<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="4F7B3EB8" />
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="XYZ789EVENTVALIDATION" />
`;

const TAKEN_RESULT_HTML = `
<span id="ctl00_cphMain_ErrorLabel" style="display:inline;"><font color="Red">LOVE is not available!</font></span>
<div id="ctl00_cphMain_ResultsDisplay" style="display:none;"></div>
`;

const AVAILABLE_RESULT_HTML = `
<span id="ctl00_cphMain_ErrorLabel" style="display:none;"><font color="Red"></font></span>
<div id="ctl00_cphMain_ResultsDisplay" style="display:inline;">
<b><span class="lgtextblue">Your selection is available</span></b>
<span id="ctl00_cphMain_SelectionFormLabel" class="lgtextblueplate">ZQXK93</span>
</div>
`;

const VALIDATION_ERROR_HTML = `
<span id="ctl00_cphMain_ErrorLabel" style="display:inline;"><font color="Red">H8 is not allowed!<br>Two letters other than ''O'' or zero are required!<br></font></span>
<div id="ctl00_cphMain_ResultsDisplay" style="display:none;"></div>
`;

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => handler(url, init)) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html" } });
}

test("maps the real 'is not available!' response to TAKEN", async () => {
  let callCount = 0;
  const restore = mockFetch(() => {
    callCount++;
    return callCount === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse(TAKEN_RESULT_HTML);
  });
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "new-hampshire-v1");
    assert.equal(callCount, 2);
  } finally {
    restore();
  }
});

test("maps the real 'Your selection is available' response to AVAILABLE", async () => {
  let callCount = 0;
  const restore = mockFetch(() => {
    callCount++;
    return callCount === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse(AVAILABLE_RESULT_HTML);
  });
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("ZQXK93");
    assert.equal(result.status, "AVAILABLE");
  } finally {
    restore();
  }
});

test("a validation error (e.g. a blacklisted combo) maps to UNKNOWN, not TAKEN", async () => {
  let callCount = 0;
  const restore = mockFetch(() => {
    callCount++;
    return callCount === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse(VALIDATION_ERROR_HTML);
  });
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("H8");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    restore();
  }
});

test("a failed GET for fresh tokens maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => htmlResponse("", 500));
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a GET page missing the WebForms tokens maps to ERROR, not thrown", async () => {
  const restore = mockFetch(() => htmlResponse("<html>no tokens here</html>"));
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("a non-200 POST response maps to ERROR, not thrown", async () => {
  let callCount = 0;
  const restore = mockFetch(() => {
    callCount++;
    return callCount === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse("", 500);
  });
  try {
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("neither the results panel nor the error label showing maps to ERROR, not a crash", async () => {
  let callCount = 0;
  const restore = mockFetch(() => {
    callCount++;
    return callCount === 1
      ? htmlResponse(GET_PAGE_HTML)
      : htmlResponse('<span id="ctl00_cphMain_ErrorLabel" style="display:none;"></span><div id="ctl00_cphMain_ResultsDisplay" style="display:none;"></div>');
  });
  try {
    const adapter = createNewHampshireAdapter();
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
    const adapter = createNewHampshireAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    restore();
  }
});

test("getOfficialUrl points at the real NH Plate Check tool", () => {
  const adapter = createNewHampshireAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://business.nh.gov/Platecheck/");
});
