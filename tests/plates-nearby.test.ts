import assert from "node:assert/strict";
import test from "node:test";
import { generateNearbyPlates } from "../lib/plates/nearbyPlates.ts";
import type { StateRules } from "../lib/plates/types.ts";

const RULES: StateRules = {
  minCharacters: 1,
  maxCharacters: 7,
  supportsSpaces: false,
  supportsHyphens: false,
  allowedCharacters: "A-Z0-9",
};

test("mixes patterns instead of returning five variations of the same trick", () => {
  const results = generateNearbyPlates("LOVE", RULES, new Set(), 4);
  assert.deepEqual(results, ["LOVE1", "1LOVE", "L0VE", "1LOVE1"]);
});

test("every candidate keeps the original letters recognizable — no arbitrary letter swap", () => {
  const results = generateNearbyPlates("LOVE", RULES, new Set(), 20);
  for (const candidate of results) {
    // Every candidate must contain "LOVE" itself, or a single-substitution
    // leetspeak version of it — never an unrelated letter change.
    const isNumberVariant = /^(LOVE\d{1,2}|\d{1,2}LOVE|\d(LOVE)\d)$/.test(candidate);
    const isLeet = candidate === "L0VE" || candidate === "LOV3" || candidate === "L0V3";
    assert.ok(isNumberVariant || isLeet, `${candidate} should be a recognizable variant of LOVE`);
  }
});

test("never falls back to an arbitrary nearest-character swap", () => {
  // "XZ" has no letters in the leetspeak map, so exhausting every number
  // and framing variant leaves nothing recognizable at all.
  const exclude = new Set<string>();
  for (let n = 1; n <= 99; n++) {
    exclude.add(`XZ${n}`);
    exclude.add(`${n}XZ`);
  }
  for (let n = 1; n <= 9; n++) exclude.add(`${n}XZ${n}`);
  const results = generateNearbyPlates("XZ", RULES, exclude, 5);
  // Must return [], not "XY"/"YZ"/or any other arbitrary adjacent swap.
  assert.deepEqual(results, []);
});

test("never returns the original plate or anything in the exclude set", () => {
  const results = generateNearbyPlates("KR3M", RULES, new Set(["KR3M", "KR3M1", "1KR3M"]), 5);
  assert.ok(!results.includes("KR3M"));
  assert.ok(!results.includes("KR3M1"));
  assert.ok(!results.includes("1KR3M"));
});

test("never returns duplicates", () => {
  const results = generateNearbyPlates("AA11", RULES, new Set(), 50);
  assert.equal(results.length, new Set(results).size);
});

test("respects the requested limit", () => {
  const results = generateNearbyPlates("LOVE", RULES, new Set(), 3);
  assert.equal(results.length, 3);
});

test("only produces candidates that still satisfy the state's own rules", () => {
  const tightRules: StateRules = { ...RULES, maxCharacters: 3, allowedCharacters: "A-Z" };
  const results = generateNearbyPlates("ABC", tightRules, new Set(), 50);
  for (const candidate of results) {
    assert.ok(/^[A-Z]{3}$/.test(candidate));
  }
});

test("an empty target with nothing to vary returns no candidates", () => {
  const results = generateNearbyPlates("", RULES, new Set(), 5);
  assert.deepEqual(results, []);
});

test("no room for a number or framing still yields leet variants when available", () => {
  const noRoomRules: StateRules = { ...RULES, maxCharacters: 4 };
  const results = generateNearbyPlates("LOVE", noRoomRules, new Set(), 5);
  assert.deepEqual(results, ["L0VE", "LOV3", "L0V3"]);
});
