import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { unlinkSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { blogCache, blogLocales } from "@web/blog-snapshot";
import { AwsError } from "../src/aws.ts";
import { blogPublishing, prepareBlog } from "../src/publish-blog.ts";
import { fixture, mockAws, param } from "./fixtures.ts";

const prefix = blogCache.slice(1);
const origin = "https://dev-www.ikuma.cloud";

function snapshot(t: Parameters<typeof fixture>[0]) {
  const { root, path, write } = fixture(t);
  const save = (key: string, value: unknown) =>
    write(`${prefix}/${key}`, JSON.stringify(value));
  const data = Buffer.from("524946460000000057454250", "hex");
  const digest = createHash("sha256")
    .update(`default:${data.length}:`)
    .update(data)
    .digest("hex");
  const media = `${prefix}/block-image/${digest}/default`;
  const slug = "static%25.post";
  write(media, data);
  save("tags.json", [{ id: "tag", icon_url: `/${media}` }]);
  const urls = [];
  for (const lang of blogLocales) {
    const meta = { slug, status: "Published", tag_ids: ["tag"] };
    save(`list/${lang}.json`, [meta]);
    const article = `article/${slug}`;
    save(`${article}/contents/${lang}.json`, {
      meta,
      surface: {
        root: "root",
        components: { root: { component: "BlockImage", src: `/${media}` } },
      },
    });
    write(`${prefix}/${article}/og-image/${lang}`, data);
    const blog = `${origin}${lang === "ja" ? "/ja" : ""}/blog`;
    const url = `${blog}/article/static%2525.post`;
    urls.push(url);
    const feed = `feed/json-feed/${lang}.json`;
    save(feed, {
      home_page_url: blog,
      feed_url: `${origin}/${prefix}/${feed}`,
      items: [{ id: url, url }],
    });
    write(
      `${prefix}/feed/rss/${lang}.xml`,
      `<rss><channel><item><link>${url}</link></item></channel></rss>`,
    );
    write(
      `${prefix}/feed/atom/${lang}.xml`,
      `<feed xmlns="http://www.w3.org/2005/Atom"><entry><id>${url}</id></entry></feed>`,
    );
  }
  const sitemap = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
  write(
    `${prefix}/sitemap.xml`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`,
  );
  return { root, path, write, slug, media };
}

test("uploads ready snapshots to versioned keys and shares only hashed images", async (t) => {
  const { root, slug, media } = snapshot(t);
  const { release, blobs } = prepareBlog(root, "dev");
  assert.equal(blobs.size, 15);
  const { aws, calls, keys } = mockAws();
  assert.equal(await blogPublishing(aws).upload("dev", root), release);
  const uploads = calls.filter(
    ([service, action]) => service === "s3api" && action === "put-object",
  );
  assert.equal(uploads.length, 15);
  for (const args of uploads) {
    assert.equal(param(args, "--if-none-match"), "*");
    assert.equal(param(args, "--expected-bucket-owner"), "owner");
    assert.equal(
      param(args, "--bucket"),
      "dev-46ki75-web-s3-bucket-blog-cache",
    );
  }
  const inline = uploads.find((args) => param(args, "--key") === media)!;
  const cover = uploads.find(
    (args) =>
      param(args, "--key") ===
      `blog-releases/${release}/${prefix}/article/${slug}/og-image/ja`,
  )!;
  assert.equal(
    param(inline, "--cache-control"),
    "public, max-age=31536000, immutable",
  );
  assert.equal(
    param(cover, "--cache-control"),
    "public, max-age=0, s-maxage=31536000",
  );
  assert.equal(param(cover, "--content-type"), "image/webp");
  assert.deepEqual([...keys], [[`blog:${release}:ready`, "1"]]);
});

test("rejects wrong-stage, invalid XML, missing images, and extra files before AWS", async (t) => {
  const { root, write, path, media } = snapshot(t);
  const { aws, calls } = mockAws();
  const publish = blogPublishing(aws);
  await assert.rejects(
    publish.upload("prod", root),
    /Build the snapshot for https:\/\/www\.ikuma\.cloud/,
  );
  write("unused.txt", "not an artifact");
  await assert.rejects(
    publish.upload("dev", root),
    /unreferenced or unexpected/,
  );
  unlinkSync(path("unused.txt"));
  const rss = `${prefix}/feed/rss/en.xml`;
  write(
    rss,
    `<!DOCTYPE rss SYSTEM "urn:example:feed"><rss><channel><item><link>${origin}/blog/article/static%2525.post</link></item></channel></rss>`,
  );
  await assert.rejects(publish.upload("dev", root), /DTDs are not allowed/);
  write(rss, "<rss>");
  await assert.rejects(publish.upload("dev", root), /Malformed snapshot XML/);
  unlinkSync(path(media));
  await assert.rejects(
    publish.upload("dev", root),
    /do not match content-derived key/,
  );
  assert.deepEqual(calls, []);
});

test("matches Atom namespace URIs rather than prefixes and rejects unbound prefixes", async (t) => {
  const { root, write } = snapshot(t);
  const { aws, calls } = mockAws();
  const publish = blogPublishing(aws);
  const feed = `${prefix}/feed/atom/en.xml`;
  const entry = `<a:entry><a:id>${origin}/blog/article/static%2525.post</a:id></a:entry>`;
  write(
    feed,
    `<a:feed xmlns:a="http://www.w3.org/2005/Atom">${entry}</a:feed>`,
  );
  assert.equal(prepareBlog(root, "dev").blobs.size, 15);
  write(feed, `<a:feed xmlns:a="urn:not-atom">${entry}</a:feed>`);
  await assert.rejects(
    publish.upload("dev", root),
    /RSS\/Atom IDs do not match/,
  );
  write(feed, `<a:feed>${entry}</a:feed>`);
  await assert.rejects(publish.upload("dev", root), /Malformed snapshot XML/);
  assert.deepEqual(calls, []);
});

test("does not mistake literal CDATA for a DTD declaration", (t) => {
  const { root, write } = snapshot(t);
  write(
    `${prefix}/feed/rss/en.xml`,
    `<rss><channel><description><![CDATA[<!DOCTYPE rss>]]></description><item><link>${origin}/blog/article/static%2525.post</link></item></channel></rss>`,
  );
  assert.equal(prepareBlog(root, "dev").blobs.size, 15);
});

test("marks no release ready after incomplete uploads", async (t) => {
  const { root } = snapshot(t);
  const { aws, keys } = mockAws(([service, action]) => {
    if (service === "s3api" && action === "put-object")
      throw new Error("incomplete object upload");
  });
  await assert.rejects(
    blogPublishing(aws).upload("dev", root),
    /incomplete object upload/,
  );
  assert.deepEqual([...keys], []);
});

test("verifies the existing object checksum and headers on a repeat upload", async (t) => {
  const { root, media } = snapshot(t);
  let headers: Record<string, string>;
  let matches = true;
  const { aws, keys, calls } = mockAws((args) => {
    if (args[0] !== "s3api" || param(args, "--key") !== media) return;
    if (args[1] === "put-object") {
      headers = {
        ChecksumSHA256: param(args, "--checksum-sha256"),
        ContentType: param(args, "--content-type"),
        CacheControl: param(args, "--cache-control"),
      };
      throw new AwsError(args, "An error occurred (PreconditionFailed)");
    }
    assert.equal(args[1], "head-object");
    assert.equal(param(args, "--checksum-mode"), "ENABLED");
    return JSON.stringify(
      matches ? headers : { ...headers, ContentType: "text/plain" },
    );
  });
  const publish = blogPublishing(aws);
  const release = await publish.upload("dev", root);
  assert.equal(keys.get(`blog:${release}:ready`), "1");
  calls.length = 0;
  matches = false;
  await assert.rejects(
    publish.upload("dev", root),
    /Existing object conflicts/,
  );
  assert.ok(!calls.some(([, action]) => action === "put-key"));
});

test("requires a ready marker and can roll back to the preserved legacy pointer", async () => {
  const release = "0123456789ab".repeat(2);
  const { aws, keys, calls } = mockAws();
  const publish = blogPublishing(aws);
  assert.equal(await publish.active("dev"), "legacy");
  await assert.rejects(
    publish.activate("dev", release),
    /Blog release is not ready/,
  );
  assert.ok(!keys.has("blog:active"));
  keys.set(`blog:${release}:ready`, "1");
  await assert.rejects(
    publish.activate("dev", release, "0".repeat(24)),
    /Active blog release changed/,
  );
  await publish.activate("dev", release, "legacy");
  assert.equal(await publish.active("dev"), release);
  calls.length = 0;
  await publish.activate("dev", release, release);
  assert.ok(!calls.some(([, action]) => action === "put-key"));
  await publish.activate("dev", "legacy", release);
  assert.equal(await publish.active("dev"), "legacy");
});

test("the direct Node CLI rejects an unknown stage and dry-runs without AWS", (t) => {
  const { root } = snapshot(t);
  const script = fileURLToPath(
    new URL("../src/publish-blog.ts", import.meta.url),
  );
  const run = (stage: string) =>
    execFileSync(
      process.execPath,
      [script, "--stage", stage, "upload", "--directory", root, "--dry-run"],
      { encoding: "utf8", env: { PATH: "" }, stdio: "pipe" },
    );
  assert.throws(() => run("production"), /Specify --stage dev, stg, or prod/);
  const { release } = prepareBlog(root, "dev");
  assert.equal(run("dev").trim(), `dev blog release ${release}: 15 objects`);
});
