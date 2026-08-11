import { test } from "node:test";
import assert from "node:assert/strict";
import { KamiSamaClient } from "../services/api/kami-sama-client.js";
import { ApiError } from "../services/errors.js";

function mockFetch(handler) {
  return async (url, options) => handler(url, options);
}

test("request unwraps the data envelope", async () => {
  const client = new KamiSamaClient({
    baseUrl: "http://api.kami-sama.localhost",
    fetchImpl: mockFetch(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ data: { items: [1, 2] }, meta: { requestId: "r1" } }),
    })),
  });

  const data = await client.discoverCatalog({ page: 1 });
  assert.deepEqual(data, { items: [1, 2] });
});

test("request throws ApiError on HTTP error", async () => {
  const client = new KamiSamaClient({
    baseUrl: "http://api.kami-sama.localhost",
    fetchImpl: mockFetch(async () => ({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({
        error: { code: "INTERNAL", message: "boom" },
        meta: { requestId: "r2" },
      }),
    })),
  });

  await assert.rejects(() => client.health(), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 500);
    assert.equal(error.code, "INTERNAL");
    assert.equal(error.requestId, "r2");
    return true;
  });
});

test("request builds query strings", async () => {
  let calledUrl = null;
  const client = new KamiSamaClient({
    baseUrl: "http://api.kami-sama.localhost",
    fetchImpl: mockFetch(async (url) => {
      calledUrl = url;
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: {} }),
      };
    }),
  });

  await client.discoverSearch("one piece", { limit: 24 });
  assert.match(calledUrl.toString(), /\/api\/v1\/discover\/search/);
  assert.match(calledUrl.searchParams.get("q"), /one piece/);
  assert.equal(calledUrl.searchParams.get("limit"), "24");
});

test("request attaches bearer token", async () => {
  let authHeader = null;
  const client = new KamiSamaClient({
    baseUrl: "http://api.kami-sama.localhost",
    fetchImpl: mockFetch(async (url, options) => {
      authHeader = options.headers["Authorization"];
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: {} }),
      };
    }),
  });

  await client.authMe("token-123");
  assert.equal(authHeader, "Bearer token-123");
});

test("asUser scopes the token without mutating the base client", async () => {
  let tokens = [];
  const client = new KamiSamaClient({
    baseUrl: "http://api.kami-sama.localhost",
    fetchImpl: mockFetch(async (url, options) => {
      tokens.push(options.headers["Authorization"]);
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ data: {} }),
      };
    }),
  });

  const userClient = client.asUser("user-token");
  await userClient.authMe();
  await client.health();
  assert.deepEqual(tokens, ["Bearer user-token", undefined]);
});
