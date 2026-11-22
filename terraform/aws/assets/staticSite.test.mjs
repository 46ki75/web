import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

const code = await readFile(new URL("./staticSite.js", import.meta.url), "utf8");
const kvs = new Map([
  ["static:active", "release"],
  ["static:release:/", "/index.html"],
  ["static:release:/ja/blog/article/example", "/ja/blog/article/example/index.html"],
  ["static:release:/content/blog/tags.json", "/content/blog/tags.json"],
  ["static:release:/en/blog", "!/blog"],
  ["static:release:404", "<!doctype html><h1>Not Found</h1>"],
  ["tester", "test:password"],
]);

function handler(requireAuth, lookup = kvs) {
  return vm.runInNewContext(
    code.replace('import cf from "cloudfront";', "")
      .replace("${require_auth}", String(requireAuth)) + "\nhandler",
    {
      Buffer,
      cf: { kvs: () => ({
        exists: async (key) => lookup.has(key),
        get: async (key) => {
          if (!lookup.has(key)) throw new Error("Key does not exist");
          return lookup.get(key);
        },
      }) },
    },
  );
}

function request(uri, options = {}) {
  return { request: { uri, method: "GET", headers: {}, querystring: {}, ...options } };
}

test("serves root, localized indexes, data, and legacy hashed bundles", async () => {
  const route = handler(false);
  assert.equal((await route(request("/"))).uri, "/site-releases/release/index.html");
  for (const suffix of ["", "/"]) {
    assert.equal((await route(request("/ja/blog/article/example" + suffix))).uri,
      "/site-releases/release/ja/blog/article/example/index.html");
  }
  assert.equal((await route(request("/content/blog/tags.json"))).uri,
    "/site-releases/release/content/blog/tags.json");
  assert.equal((await route(request("/build/old-fingerprint.js"))).uri, "/build/old-fingerprint.js");
});

test("issues permanent redirects without dropping encoded or repeated query values", async () => {
  const route = handler(false);
  const redirect = await route(request("/en/blog", { querystring: {
    q: { value: "a%20b", multiValue: [{ value: "a%20b" }, { value: "%26" }] },
    source: { value: "old" },
  } }));
  assert.equal(redirect.statusCode, 308);
  assert.equal(redirect.headers.location.value, "/blog?q=a%20b&q=%26&source=old");
});

test("returns custom HTML with HTTP 404 and no body for HEAD", async () => {
  const route = handler(false);
  for (const uri of ["/ja/blog/article/missing", "/no-file.xml", "/" + "a".repeat(512)]) {
    const missing = await route(request(uri));
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.body, kvs.get("static:release:404"));
    const head = await route(request(uri, { method: "HEAD" }));
    assert.equal(head.statusCode, 404);
    assert.equal(head.body, undefined);
  }
  assert.equal((await handler(false, new Map())(request("/"))).statusCode, 503);
});

test("treats a retired API route as a missing website path", async () => {
  const uri = "/api/v2/blog";
  const publicResponse = await handler(false)(request(uri));
  assert.equal(publicResponse.statusCode, 404);
  assert.equal(publicResponse.headers["content-type"].value, "text/html; charset=utf-8");
  assert.equal((await handler(true)(request(uri))).statusCode, 401);
});

test("retries a transient manifest lookup failure", async () => {
  let firstLookup = true;
  const transient = {
    has(key) {
      if (firstLookup && key === "static:release:/") {
        firstLookup = false;
        throw new Error("temporarily unavailable");
      }
      return kvs.has(key);
    },
    get: (key) => kvs.get(key),
  };
  assert.equal((await handler(false, transient)(request("/"))).uri,
    "/site-releases/release/index.html");
});

test("preserves authenticated access in non-production and protects redirects", async () => {
  const route = handler(true);
  assert.equal((await route(request("/en/blog"))).statusCode, 401);
  const auth = (credentials) => ({ headers: { authorization: {
    value: "Basic " + Buffer.from(credentials).toString("base64"),
  } } });
  assert.equal((await route(request("/", auth("tester:wrong")))).statusCode, 401);
  assert.equal((await route(request("/", auth("tester:test:password")))).uri,
    "/site-releases/release/index.html");
});
