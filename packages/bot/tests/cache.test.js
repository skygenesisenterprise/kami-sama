import { test } from "node:test";
import assert from "node:assert/strict";
import { createCache } from "../services/cache.js";
import { env } from "../config/env.js";

test("remember caches producer result", async () => {
  const cache = createCache(null);
  let calls = 0;
  const producer = () => {
    calls += 1;
    return { value: calls };
  };

  const first = await cache.remember("key:1", producer);
  const second = await cache.remember("key:1", producer);
  assert.deepEqual(first, { value: 1 });
  assert.deepEqual(second, { value: 1 });
  assert.equal(calls, 1);
});

test("expired entries are not returned", async () => {
  const cache = createCache(null);
  await cache.set("key:2", "value", 50);
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(await cache.get("key:2"), undefined);
});

test("del removes an entry", async () => {
  const cache = createCache(null);
  await cache.set("key:3", "value");
  await cache.del("key:3");
  assert.equal(await cache.get("key:3"), undefined);
});

test("disabled cache never stores", async () => {
  const previous = env.cacheEnabled;
  env.cacheEnabled = false;
  try {
    const cache = createCache(null);
    await cache.set("key:4", "value");
    assert.equal(await cache.get("key:4"), undefined);
  } finally {
    env.cacheEnabled = previous;
  }
});
