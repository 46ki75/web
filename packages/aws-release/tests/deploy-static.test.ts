import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { symlinkSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { prepareStatic, staticDeployment } from "../src/deploy-static.ts";
import { fixture, mockAws, param } from "./fixtures.ts";

function site(t: Parameters<typeof fixture>[0]) {
  const files = fixture(t);
  for (const [key, data] of Object.entries({
    "index.html": '<link rel="canonical" href="https://dev-www.ikuma.cloud/">',
    "ja/index.html": "Japanese home",
    "404.html": "Not Found",
    "robots.txt": "robots",
    "sitemap-index.xml": "sitemap",
    "en/blog/index.html": "legacy redirect",
    "ja/about/index.html": "legacy redirect",
    "build/app-hash.js": "bundle",
    "content/media/picture.webp": "image",
    "cache/v3/blog/list/en.json": "separate publisher cache",
    "api/health": "separate API",
  }))
    files.write(key, data);
  return files;
}

test("preserves the Python release ID and versioned CloudFront routes", (t) => {
  const { root, write } = site(t);
  const { release, entries } = prepareStatic(root, "dev");
  assert.equal(release, "6b613b3d6516f4134083f050");
  const routes = Object.fromEntries(
    entries.map(({ Key, Value }) => [
      Key.slice(`static:${release}:`.length),
      Value,
    ]),
  );
  assert.equal(routes["/"], "/index.html");
  assert.equal(routes["/ja"], "/ja/index.html");
  assert.equal(routes["/en/blog"], "!/blog");
  assert.equal(routes["/ja/about/index.html"], "!/ja/");
  assert.equal(routes["404"], "Not Found");
  for (const path of [
    "/build/app-hash.js",
    "/cache/v3/blog/list/en.json",
    "/api/health",
  ])
    assert.ok(!Object.hasOwn(routes, path));
  write("cache/v3/blog/list/en.json", "modified publisher cache");
  assert.equal(prepareStatic(root, "dev").release, release);
  write("ja/index.html", "new Japanese home");
  assert.notEqual(prepareStatic(root, "dev").release, release);
});

test("preserves Python path ordering and quoting for non-ASCII and punctuated files", (t) => {
  const { root, write } = site(t);
  for (const key of [
    "x/a!'().txt",
    "x-file.txt",
    "日本/😀.txt",
    "日本/\uE000.txt",
  ])
    write(key, key);
  const { release, entries } = prepareStatic(root, "dev");
  // Golden value from deploy-static-aws.py on the same artifact.
  assert.equal(release, "26888d339dab78f89b63dc5f");
  assert.ok(entries.some(({ Value }) => Value === "/x/a%21%27%28%29.txt"));
});

test("rejects wrong-stage and oversized artifacts, and symlinks, before any AWS call", async (t) => {
  const { root, write, path } = site(t);
  const { aws, calls } = mockAws();
  const deploy = staticDeployment(aws);
  await assert.rejects(
    deploy.upload("prod", root),
    /https:\/\/www\.ikuma\.cloud\//,
  );
  write("404.html", "あ".repeat(342));
  await assert.rejects(deploy.upload("dev", root), /KeyValueStore limits/);
  write("404.html", "Not Found");
  symlinkSync(path("build"), path("link"));
  await assert.rejects(deploy.upload("dev", root), /symlinks/);
  await assert.rejects(
    deploy.activate("dev", `${"f".repeat(23)}\n`),
    /Expected a 24-character release ID/,
  );
  assert.deepEqual(calls, []);
});

test("batches routes and keeps the active pointer unchanged until guarded activation", async (t) => {
  const { root, write } = site(t);
  for (let i = 0; i < 100; i++) write(`extra/page-${i}.txt`, "extra");
  const { aws, calls, keys } = mockAws();
  const deploy = staticDeployment(aws);
  const previous = "f".repeat(24);
  keys.set("static:active", previous);
  keys.set(`static:${previous}:ready`, "1");
  const release = await deploy.upload("dev", root);
  const transfers = calls.filter(([service]) => service === "s3");
  assert.equal(transfers.length, 3);
  assert.equal(
    transfers[1][3],
    `s3://dev-46ki75-web-s3-bucket-web/site-releases/${release}/`,
  );
  assert.ok(transfers[1].includes("cache/*"));
  assert.equal(
    calls.filter(([, operation]) => operation === "update-keys").length,
    3,
  );
  assert.equal(param(calls.at(-1)!, "--key"), `static:${release}:ready`);
  assert.equal(await deploy.active("dev"), previous);
  await assert.rejects(
    deploy.activate("dev", release, "none"),
    /Active static release changed/,
  );
  await assert.rejects(
    deploy.activate("dev", "a".repeat(24)),
    /Static release is not ready/,
  );
  assert.equal(await deploy.active("dev"), previous);
  await deploy.activate("dev", release, previous);
  assert.equal(await deploy.active("dev"), release);
  await deploy.activate("dev", previous, release);
  assert.equal(await deploy.active("dev"), previous);
});

test("reports a concurrent CloudFront change without overwriting the pointer", async () => {
  const release = "1".repeat(24);
  const state = mockAws((args) => {
    if (
      args[1] === "get-key" &&
      param(args, "--key") === `static:${release}:ready`
    )
      state.bump();
  });
  state.keys.set(`static:${release}:ready`, "1");
  const deploy = staticDeployment(state.aws);
  await assert.rejects(deploy.activate("dev", release, "none"), /stale ETag/);
  assert.equal(await deploy.active("dev"), "none");
});

test("the direct Node CLI can dry-run without AWS CLI or credentials", (t) => {
  const { root } = site(t);
  const script = fileURLToPath(
    new URL("../src/deploy-static.ts", import.meta.url),
  );
  const text = execFileSync(
    process.execPath,
    [script, "--stage", "dev", "upload", "--directory", root, "--dry-run"],
    { encoding: "utf8", env: { PATH: "" } },
  );
  assert.match(
    text,
    /dev release 6b613b3d6516f4134083f050: 13 static routes and values/,
  );
});
