import assert from "node:assert/strict";
import test from "node:test";
import { createWyomingAdapter } from "../lib/plates/adapters/wyoming.ts";

// Real fragments captured from webapp.dot.state.wy.us/ao/f?p=174:12 and its
// wwv_flow.ajax endpoint — see wyoming.ts for the full recon writeup.
const GET_PAGE_HTML = `
<input type="hidden" value="6121416545874" id="pInstance" />
<input type="hidden" value="67311017368172338780089976965634347420" id="pSalt" />
<input type="hidden" id="pPageItemsProtected" value="UDEyX1VTRVJfSUQ&#x2F;fTJDJheBQBzMWIJtL4dee0wyGu2Xs6Tep" />
<script>
apex.da.gEventList = [
{"triggeringElementType":"BUTTON","conditionElement":"P12_PLATE_COMBINATION","actionList":[{"action":"NATIVE_SUBMIT_PAGE"},{"ajaxIdentifier":"REEgVFlQRX5-MTAyODc0NTkxMDQ4NDc4NTY0Mzk\\u002FJMLzWojCFLKEKQEGJpXz"}]}
];
</script>
`;

function htmlResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html" } });
}

function ajaxJsonResponse(items: { id: string; value: string }[], status = 200) {
  return new Response(JSON.stringify({ item: items }), { status, headers: { "content-type": "application/json" } });
}

function mockFetch(handler: (callCount: number) => Promise<Response> | Response) {
  let callCount = 0;
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    callCount++;
    return handler(callCount);
  }) as typeof fetch;
  return {
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

test("maps a non-empty results list to AVAILABLE", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : ajaxJsonResponse([
          {
            id: "P12_RESULTS",
            value: "The plate combination is available in the following counties:<br><ul><li>1 - P - ZQXBV</li></ul>",
          },
          { id: "P12_ERRORS", value: "" },
        ])
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("ZQXBV");
    assert.equal(result.status, "AVAILABLE");
    assert.equal(result.source, "live");
    assert.equal(result.adapterVersion, "wyoming-v1");
  } finally {
    mock.restore();
  }
});

test("maps the bare 'not available' error to TAKEN", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : ajaxJsonResponse([
          { id: "P12_RESULTS", value: "" },
          {
            id: "P12_ERRORS",
            value:
              '<div style="border:1px solid red;padding: 10px;">Error validating plate:<br>1 - P - LOVE<ul><li>Plate combination is not available.</li></ul></div>',
          },
        ])
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("LOVE");
    assert.equal(result.status, "TAKEN");
  } finally {
    mock.restore();
  }
});

test("a W/M-count validation error maps to UNKNOWN, not TAKEN", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : ajaxJsonResponse([
          { id: "P12_RESULTS", value: "" },
          {
            id: "P12_ERRORS",
            value:
              '<div>Error validating plate:<br>0 - P - WWWWZ<ul><li>No combination with more than three W\'s or M\'s is allowed.</li></ul></div>',
          },
        ])
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("WWWWZ");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    mock.restore();
  }
});

test("a no-leading-zero numeric validation error maps to UNKNOWN, not TAKEN", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : ajaxJsonResponse([
          { id: "P12_RESULTS", value: "" },
          {
            id: "P12_ERRORS",
            value:
              "<div>Error validating plate:<br>0 - P - 98271<ul><li>No combination of entirely numbers is allowed unless the first number is a zero.</li></ul></div>",
          },
        ])
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("98271");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    mock.restore();
  }
});

test("a symbol/character validation error maps to UNKNOWN, not TAKEN", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : ajaxJsonResponse([
          { id: "P12_RESULTS", value: "" },
          {
            id: "P12_ERRORS",
            value:
              "<div>Error validating plate:<br>0 - P - AB#CD<ul><li>Only Capital Letters and Arabic numbers are allowed.</li></ul></div>",
          },
        ])
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("AB#CD");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    mock.restore();
  }
});

test("a raw backend error response (no item array) maps to UNKNOWN, not thrown", async () => {
  const mock = mockFetch((call) =>
    call === 1
      ? htmlResponse(GET_PAGE_HTML)
      : new Response(JSON.stringify({ error: "Ajax call returned server error ORA-06502" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
  );
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("ABCDEF");
    assert.equal(result.status, "UNKNOWN");
  } finally {
    mock.restore();
  }
});

test("a GET missing the session tokens maps to ERROR, not thrown", async () => {
  const mock = mockFetch(() => htmlResponse("<html>no tokens here</html>"));
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    mock.restore();
  }
});

test("a non-200 GET maps to ERROR, not thrown", async () => {
  const mock = mockFetch(() => htmlResponse("", 500));
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    mock.restore();
  }
});

test("a non-200 POST maps to ERROR, not thrown", async () => {
  const mock = mockFetch((call) => (call === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse("", 500)));
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    mock.restore();
  }
});

test("a non-JSON POST body maps to ERROR, not thrown", async () => {
  const mock = mockFetch((call) => (call === 1 ? htmlResponse(GET_PAGE_HTML) : htmlResponse("<html>")));
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    mock.restore();
  }
});

test("a network failure maps to ERROR instead of throwing", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  try {
    const adapter = createWyomingAdapter();
    const result = await adapter.checkAvailability("X");
    assert.equal(result.status, "ERROR");
  } finally {
    globalThis.fetch = original;
  }
});

test("getOfficialUrl points at the real WY prestige plate search tool", () => {
  const adapter = createWyomingAdapter();
  assert.equal(adapter.getOfficialUrl(), "https://webapp.dot.state.wy.us/ao/f?p=174:12");
});
