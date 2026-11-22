import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const code = await readFile(new URL("./blogSnapshots.js", import.meta.url), "utf8");
const release = "0123456789abcdef01234567";
const router = (store) => vm.runInNewContext(
  code.replace('import cf from "cloudfront";', "") + "\nhandler",
  { cf: { kvs: () => store } },
);
const route = (store, uri, method = "GET") => router(store)({ request: { uri, method, querystring: { q: { value: "test" } } } });
const active = (value = release) => ({ exists: async () => true, get: async () => value });

test("selects one immutable release without disturbing paths, query strings, or HEAD", async () => {
  const article = "/cache/v3/blog/article/100%25%20%E6%97%A5/contents/ja.json";
  const r = await route(active(), article, "HEAD");
  assert.equal(r.uri, "/blog-releases/" + release + article);
  assert.equal(r.method, "HEAD");
  assert.equal(r.querystring.q.value, "test");
  assert.equal((await route(active(), "/cache/v3/blog/feed/rss/en.xml")).uri,
    "/blog-releases/" + release + "/cache/v3/blog/feed/rss/en.xml");
});

test("keeps shared assets and v2 URLs, and preserves the Rust baseline for rollback", async () => {
  for (const uri of ["/cache/v2/blog/list/en.json", "/cache/v3/blog/block-image/test/default"]) {
    assert.equal((await route({}, uri)).uri, uri);
  }
  const list = "/cache/v3/blog/list/en.json";
  assert.equal((await route({ exists: async () => false }, list)).uri, list);
  assert.equal((await route(active("legacy"), list)).uri, list);
});

test("rejects traversal and fails closed if the active release cannot be read", async () => {
  for (const uri of ["/cache/%2e%2e/internal/secret", "/cache/a%2fb", "/cache/a%5Cb", "/cache/%G1", "/internal/manifest"]) {
    assert.equal((await route({}, uri)).statusCode, 404);
  }
  const list = "/cache/v3/blog/list/en.json";
  assert.equal((await route(active("wrong-id"), list)).statusCode, 503);
  let attempts = 0;
  const transient = { ...active(), get: async () => {
    if (attempts++ === 0) throw new Error("temporarily unavailable");
    return release;
  } };
  assert.equal((await route(transient, list)).uri, "/blog-releases/" + release + list);
  assert.equal(attempts, 2);
});
