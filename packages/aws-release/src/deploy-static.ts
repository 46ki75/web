import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  awsCli,
  immutable,
  isRelease,
  releaseCli,
  releaseStore,
  siteOrigin,
  type Aws,
  type Stage,
} from "./aws.ts";
import { listFiles, sha256, sortedKeys } from "./files.ts";

const defaultDirectory = fileURLToPath(
  new URL("../../web-solid/dist/client/", import.meta.url),
);

function redirect(path: string) {
  if (path === "/about") return "/";
  if (path === "/ja/about") return "/ja/";
  if (path === "/en" || path.startsWith("/en/")) return path.slice(3) || "/";
}

function comparePath(left: string, right: string) {
  // The previous uploader sorted Python Path objects by path segments.
  const a = left.split("/");
  const b = right.split("/");
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const result = Buffer.compare(Buffer.from(a[i]), Buffer.from(b[i]));
    if (result) return result;
  }
  return a.length - b.length;
}

function publicPath(key: string) {
  return (
    "/" +
    key
      .split("/")
      .map((segment) =>
        encodeURIComponent(segment).replace(
          /[!'()*]/g,
          (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
        ),
      )
      .join("/")
  );
}

export function prepareStatic(directory: string, stage: Stage) {
  const files = listFiles(directory);
  const home = files.get("index.html");
  const origin = siteOrigin(stage);
  if (
    !home ||
    !readFileSync(home, "utf8").includes(
      `<link rel="canonical" href="${origin}/"`,
    )
  ) {
    throw new Error(`Build the static site for ${origin}/ before uploading`);
  }
  for (const key of [
    "404.html",
    "ja/index.html",
    "robots.txt",
    "sitemap-index.xml",
  ]) {
    if (!files.has(key))
      throw new Error(`Missing required static file: ${key}`);
  }
  const digest = createHash("sha256");
  const routes = new Map([
    ["404", readFileSync(files.get("404.html")!, "utf8")],
  ]);
  for (const key of [...files.keys()].sort(comparePath)) {
    const path = publicPath(key);
    if (path.startsWith("/api/") || path.startsWith("/cache/")) continue;
    digest.update(`${path}\0`).update(sha256(readFileSync(files.get(key)!)));
    if (path.startsWith("/build/")) continue;
    if (path.endsWith("/index.html")) {
      const page = path.slice(0, -"/index.html".length) || "/";
      const target = redirect(page);
      const value = target ? `!${target}` : path;
      routes.set(page, value);
      routes.set(path, value);
    } else {
      routes.set(path, path);
    }
  }
  const release = digest.digest("hex").slice(0, 24);
  const entries = sortedKeys(routes).map((path) => ({
    Key: `static:${release}:${path}`,
    Value: routes.get(path)!,
  }));
  if (
    entries.some(
      ({ Key, Value }) =>
        Buffer.byteLength(Key) > 512 || Buffer.byteLength(Value) > 1024,
    )
  ) {
    throw new Error(
      "A route or the 404 page exceeds CloudFront KeyValueStore limits",
    );
  }
  return { release, entries };
}

export function staticDeployment(aws: Aws = awsCli("3")) {
  const store = (stage: Stage) => releaseStore(aws, stage, "static");
  return {
    async upload(stage: Stage, directory: string, dryRun = false) {
      const artifact = resolve(directory);
      const { release, entries } = prepareStatic(artifact, stage);
      console.log(
        `${stage} release ${release}: ${entries.length} static routes and values`,
      );
      if (dryRun) return release;
      const state = await store(stage);
      let version = await state.etag();
      const bucket = `s3://${stage}-46ki75-web-s3-bucket-web`;
      const destination = `${bucket}/site-releases/${release}/`;
      await aws(
        "s3",
        "sync",
        join(artifact, "build"),
        `${bucket}/build/`,
        "--cache-control",
        immutable,
        "--no-follow-symlinks",
        "--only-show-errors",
      );
      await aws(
        "s3",
        "cp",
        artifact,
        destination,
        "--recursive",
        "--cache-control",
        "no-cache",
        "--exclude",
        "api/*",
        "--exclude",
        "cache/*",
        "--exclude",
        "build/*",
        "--exclude",
        "content/media/*",
        "--no-follow-symlinks",
        "--only-show-errors",
      );
      await aws(
        "s3",
        "cp",
        join(artifact, "content", "media"),
        destination + "content/media/",
        "--recursive",
        "--cache-control",
        immutable,
        "--no-follow-symlinks",
        "--only-show-errors",
      );
      for (let offset = 0; offset < entries.length; offset += 50) {
        version = await state.kvs(
          "update-keys",
          "--if-match",
          version,
          "--puts",
          JSON.stringify(entries.slice(offset, offset + 50)),
          "--query",
          "ETag",
          "--output",
          "text",
        );
      }
      await state.markReady(version, release);
      console.log(
        `Prepared ${stage} release ${release}; active pointer unchanged.`,
      );
      return release;
    },
    async active(stage: Stage) {
      return (await store(stage)).active();
    },
    async activate(stage: Stage, release: string, expect?: string) {
      if (!isRelease(release))
        throw new Error("Expected a 24-character release ID");
      const previous = await (await store(stage)).activate(release, expect);
      console.log(`${stage} website release: ${previous} -> ${release}`);
    },
  };
}

if (import.meta.main) {
  await releaseCli({
    script: "packages/aws-release/src/deploy-static.ts",
    defaultDirectory,
    ...staticDeployment(),
  });
}
