import assert from "node:assert/strict";
import test from "node:test";
import { normalizePlate } from "../lib/plates/normalize.ts";
import { validatePlate } from "../lib/plates/validation.ts";
import type { StateRules } from "../lib/plates/types.ts";

const OHIO_LIKE: StateRules = {
  minCharacters: 2,
  maxCharacters: 7,
  supportsSpaces: false,
  supportsHyphens: false,
  allowedCharacters: "A-Z0-9",
};

const WV_LIKE: StateRules = {
  minCharacters: 2,
  maxCharacters: 8,
  supportsSpaces: true,
  supportsHyphens: false,
  allowedCharacters: "A-Z0-9 ",
  forbiddenPatterns: ["^\\d+$"], // numbers-only not allowed, matching the "no numeric-only" style rule some states use
};

test("normalizePlate strips spaces and hyphens when unsupported, uppercases", () => {
  assert.equal(normalizePlate("  kr 3m-1  ", OHIO_LIKE), "KR3M1");
});

test("normalizePlate collapses repeated spaces when supported", () => {
  assert.equal(normalizePlate("k   r  3m", WV_LIKE), "K R 3M");
});

test("validatePlate rejects too short and too long", () => {
  assert.equal(validatePlate("A", OHIO_LIKE).valid, false);
  assert.equal(validatePlate("TOOLONGPLATE", OHIO_LIKE).valid, false);
});

test("validatePlate rejects disallowed characters", () => {
  const result = validatePlate("K-R3M", OHIO_LIKE);
  assert.equal(result.valid, false);
});

test("validatePlate rejects a forbidden pattern", () => {
  const result = validatePlate("123456", WV_LIKE);
  assert.equal(result.valid, false);
});

test("validatePlate accepts a plate within all rules", () => {
  assert.deepEqual(validatePlate("KR3M1", OHIO_LIKE), { valid: true });
});
