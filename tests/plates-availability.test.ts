import assert from "node:assert/strict";
import test from "node:test";
import { isCacheFresh, nextHealthStatus } from "../lib/plates/availabilityRules.ts";

test("isCacheFresh accepts a result checked within the TTL window", () => {
  const now = Date.parse("2026-08-15T12:00:00.000Z");
  const checkedAt = "2026-08-15T11:00:00.000Z"; // 60 min ago
  assert.equal(isCacheFresh(checkedAt, 90, now), true); // TTL 90 min
});

test("isCacheFresh rejects a result older than the TTL window", () => {
  const now = Date.parse("2026-08-15T12:00:00.000Z");
  const checkedAt = "2026-08-15T10:00:00.000Z"; // 120 min ago
  assert.equal(isCacheFresh(checkedAt, 90, now), false); // TTL 90 min
});

test("isCacheFresh treats exactly-at-TTL as still fresh (inclusive boundary)", () => {
  const now = Date.parse("2026-08-15T12:00:00.000Z");
  const checkedAt = "2026-08-15T10:30:00.000Z"; // exactly 90 min ago
  assert.equal(isCacheFresh(checkedAt, 90, now), true);
});

test("nextHealthStatus stays HEALTHY below the circuit breaker threshold", () => {
  assert.equal(nextHealthStatus(0), "HEALTHY");
  assert.equal(nextHealthStatus(1), "HEALTHY");
  assert.equal(nextHealthStatus(2), "HEALTHY");
});

test("nextHealthStatus trips to DEGRADED once the threshold is reached", () => {
  assert.equal(nextHealthStatus(3), "DEGRADED");
  assert.equal(nextHealthStatus(10), "DEGRADED");
});
