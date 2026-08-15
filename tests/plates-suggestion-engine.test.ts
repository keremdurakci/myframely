import assert from "node:assert/strict";
import test from "node:test";
import { generateSuggestions } from "../lib/plates/suggestionEngine.ts";
import { validatePlate } from "../lib/plates/validation.ts";
import type { StateRules } from "../lib/plates/types.ts";

const RULES: StateRules = {
  minCharacters: 2,
  maxCharacters: 7,
  supportsSpaces: false,
  supportsHyphens: false,
  allowedCharacters: "A-Z0-9",
};

test("returns a non-empty, deduplicated list for a normal word", () => {
  const results = generateSuggestions({ word: "KEREM", rules: RULES });
  assert.ok(results.length > 0);
  const plates = results.map((r) => r.plate);
  assert.equal(new Set(plates).size, plates.length);
});

test("every suggestion satisfies the state's own validation rules", () => {
  const results = generateSuggestions({ word: "KEREM", number: "82", rules: RULES });
  for (const r of results) {
    assert.equal(validatePlate(r.plate, RULES).valid, true, `${r.plate} should be valid`);
    assert.ok(r.plate.length <= RULES.maxCharacters);
  }
});

test("results are sorted by score, highest first", () => {
  const results = generateSuggestions({ word: "KEREM", rules: RULES });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].score >= results[i].score);
  }
});

test("the plain word ranks at or near the top when it fits and no style is given", () => {
  const results = generateSuggestions({ word: "KEREM", rules: RULES });
  const top3 = results.slice(0, 3).map((r) => r.plate);
  assert.ok(top3.includes("KEREM"), `expected KEREM near the top, got ${top3.join(", ")}`);
});

test("a requested number appears in at least one suggestion", () => {
  const results = generateSuggestions({ word: "KEREM", number: "82", rules: RULES });
  assert.ok(results.some((r) => r.plate.includes("82")));
});

test("minimal style favors vowel-dropped/shorter variants over clean style", () => {
  const minimal = generateSuggestions({ word: "KEREM", rules: RULES, style: "minimal" });
  const clean = generateSuggestions({ word: "KEREM", rules: RULES, style: "clean" });
  assert.equal(minimal[0].tags.includes("vowel-dropped"), true);
  assert.equal(clean[0].plate, "KEREM");
});

test("a word too short to produce any valid candidate returns an empty list, not an error", () => {
  const results = generateSuggestions({ word: "", rules: RULES });
  assert.deepEqual(results, []);
});

test("no suggestion collapses into an unrecognizable run of repeated characters", () => {
  const results = generateSuggestions({ word: "MUSTANG", number: "1969", rules: RULES });
  for (const r of results) {
    assert.equal(/(.)\1{2,}/.test(r.plate), false, `${r.plate} looks like gibberish`);
  }
});
