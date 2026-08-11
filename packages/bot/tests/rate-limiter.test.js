import { test } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter } from "../services/rate-limiter.js";

test("allows requests under the limit", () => {
  const limiter = new RateLimiter({ windowMs: 1000, max: 3 });
  for (let i = 0; i < 3; i += 1) {
    assert.equal(limiter.consume("user:a").allowed, true);
  }
});

test("blocks requests over the limit and reports retryAfter", () => {
  const limiter = new RateLimiter({ windowMs: 1000, max: 2 });
  limiter.consume("user:a");
  limiter.consume("user:a");
  const result = limiter.consume("user:a");
  assert.equal(result.allowed, false);
  assert.ok(result.retryAfterMs > 0);
});

test("assert throws on over-limit", () => {
  const limiter = new RateLimiter({ windowMs: 1000, max: 1 });
  limiter.assert("cmd:x");
  assert.throws(() => limiter.assert("cmd:x"), { code: "RATE_LIMITED" });
});

test("keys are independent", () => {
  const limiter = new RateLimiter({ windowMs: 1000, max: 1 });
  limiter.consume("user:a");
  assert.equal(limiter.consume("user:b").allowed, true);
});
