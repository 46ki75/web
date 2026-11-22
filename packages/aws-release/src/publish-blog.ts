import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { blogCache, blogLocales, isArticleSlug } from "@web/blog-snapshot";
import {
  DOMParser,
  Node,
  onWarningStopParsing,
  type Document,
} from "@xmldom/xmldom";
import {
  AwsError,
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

const prefix = blogCache.slice(1);
const media = `${prefix}/block-image/`;
const variants = ["default", "small", "medium", "large"];
const asset = /^([0-9a-f]{64})\/(default|small|medium|large)$/;
const mutable = "public, max-age=0, s-maxage=31536000";
const atomNs = "http://www.w3.org/2005/Atom";
const sitemapNs = "http://www.sitemaps.org/schemas/sitemap/0.9";

type Blob = { file: string; mime: string; checksum: Buffer };

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Invalid snapshot document: expected an object");
  }
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value))
    throw new Error("Invalid snapshot document: expected an array");
  return value;
}

function xmlValues(
  data: Buffer,
  path: string[],
  namespace: string | null = null,
) {
  let document: Document;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
    document = new DOMParser({ onError: onWarningStopParsing }).parseFromString(
      text,
      "application/xml",
    );
  } catch {
    throw new Error("Malformed snapshot XML");
  }
  // xmldom records the doctype without resolving its entities. Check the node
  // rather than scanning for a string that can also appear in article CDATA.
  if (document.doctype)
    throw new Error(
      "Not a generated snapshot XML document: DTDs are not allowed",
    );

  const values: string[] = [];
  function visit(parent: Node, depth: number) {
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      if (
        child.nodeType !== Node.ELEMENT_NODE ||
        child.localName !== path[depth] ||
        child.namespaceURI !== namespace
      )
        continue;
      if (depth < path.length - 1) {
        visit(child, depth + 1);
      } else {
        let value = "";
        for (let text = child.firstChild; text; text = text.nextSibling) {
          if (
            text.nodeType === Node.TEXT_NODE ||
            text.nodeType === Node.CDATA_SECTION_NODE
          )
            value += text.nodeValue ?? "";
        }
        values.push(value);
      }
    }
  }
  visit(document, 0);
  return values;
}

export function prepareBlog(directory: string, stage: Stage) {
  const files = listFiles(directory);
  const blobs = new Map<string, Blob>();
  function read(key: string, mime: string) {
    const file = files.get(key);
    if (!file) throw new Error(`Missing snapshot object: ${key}`);
    const data = readFileSync(file);
    if (
      mime === "image/webp" &&
      (data.toString("latin1", 0, 4) !== "RIFF" ||
        data.toString("latin1", 8, 12) !== "WEBP")
    ) {
      throw new Error(`Not a WebP object: ${key}`);
    }
    blobs.set(key, { file, mime, checksum: sha256(data) });
    return data;
  }
  function json(key: string): unknown {
    const data = read(key, "application/json");
    try {
      return JSON.parse(data.toString("utf8"));
    } catch {
      throw new Error(`Invalid snapshot JSON: ${key}`);
    }
  }
  const mediaByHash = new Map<string, Set<string>>();
  function image(url: unknown) {
    if (typeof url !== "string" || !url.startsWith(`/${media}`)) {
      throw new Error(
        "Published images must point to a bundled snapshot object",
      );
    }
    const suffix = url.slice(media.length + 1);
    const match = asset.exec(suffix);
    if (!match || match[0] !== suffix)
      throw new Error("Invalid content-addressed image key");
    const [, digest, variant] = match;
    let present = mediaByHash.get(digest);
    if (!present) {
      const contentHash = createHash("sha256");
      present = new Set();
      for (const name of variants) {
        const key = `${media}${digest}/${name}`;
        if (files.has(key)) {
          const data = read(key, "image/webp");
          contentHash.update(`${name}:${data.length}:`).update(data);
          present.add(name);
        }
      }
      if (!present.has("default") || contentHash.digest("hex") !== digest) {
        throw new Error(
          `Image bytes do not match content-derived key: ${digest}`,
        );
      }
      mediaByHash.set(digest, present);
    }
    if (!present.has(variant))
      throw new Error(`Missing image variant: ${digest}/${variant}`);
  }

  const tags = array(json(`${prefix}/tags.json`)).map(object);
  const tagIds = new Set<string>();
  for (const tag of tags) {
    if (typeof tag.id !== "string" || tagIds.has(tag.id))
      throw new Error("Invalid or duplicate tag ID");
    tagIds.add(tag.id);
    if (tag.icon_url != null) image(tag.icon_url);
  }
  const urls = new Set<string>();
  const origin = siteOrigin(stage);
  for (const lang of blogLocales) {
    const index = array(json(`${prefix}/list/${lang}.json`));
    if (!index.length) throw new Error(`Empty ${lang} article index`);
    const slugs = new Set<string>();
    const langUrls: string[] = [];
    const blogUrl = `${origin}${lang === "ja" ? "/ja" : ""}/blog`;
    for (const item of index) {
      const meta = object(item);
      const slug = meta.slug;
      if (
        typeof slug !== "string" ||
        !isArticleSlug(slug) ||
        slugs.has(slug) ||
        meta.status !== "Published"
      ) {
        throw new Error(
          `Invalid, unpublished, or duplicate entry in the ${lang} index`,
        );
      }
      if (
        array(meta.tag_ids).some(
          (id) => typeof id !== "string" || !tagIds.has(id),
        )
      )
        throw new Error(`Unknown tag in the ${lang} index`);
      slugs.add(slug);
      langUrls.push(`${blogUrl}/article/${encodeURIComponent(slug)}`);
      const article = `${prefix}/article/${slug}`;
      read(`${article}/og-image/${lang}`, "image/webp");
      const contents = object(json(`${article}/contents/${lang}.json`));
      const surface = object(contents.surface);
      const components = object(surface.components);
      if (
        !isDeepStrictEqual(contents.meta, meta) ||
        typeof surface.root !== "string" ||
        !Object.hasOwn(components, surface.root)
      ) {
        throw new Error(
          `Article metadata or surface does not match index: ${lang}/${slug}`,
        );
      }
      for (const component of Object.values(components).map(object)) {
        if (
          component.component === "BlockImage" ||
          component.component === "Icon"
        ) {
          image(component.src);
          if (component.srcset != null) {
            if (typeof component.srcset !== "string")
              throw new Error("Invalid image srcset");
            for (const variant of component.srcset.split(", ")) {
              if (variant) image(variant.split(" ", 1)[0]);
            }
          }
        }
        if (component.component === "NotionCallout" && component.icon != null) {
          const icon = object(component.icon);
          if (icon.kind === "image") image(icon.src);
        }
      }
    }
    const feedKey = `${prefix}/feed/json-feed/${lang}.json`;
    const feed = object(json(feedKey));
    const items = array(feed.items).map(object);
    if (
      feed.home_page_url !== blogUrl ||
      feed.feed_url !== `${origin}/${feedKey}` ||
      !isDeepStrictEqual(
        items.map((item) => item.id),
        langUrls,
      ) ||
      !isDeepStrictEqual(
        items.map((item) => item.url),
        langUrls,
      )
    ) {
      throw new Error(
        `Build the snapshot for ${origin}; feed does not match its ${lang} article index`,
      );
    }
    const rss = xmlValues(
      read(`${prefix}/feed/rss/${lang}.xml`, "application/xml"),
      ["rss", "channel", "item", "link"],
    );
    const atom = xmlValues(
      read(`${prefix}/feed/atom/${lang}.xml`, "application/xml"),
      ["feed", "entry", "id"],
      atomNs,
    );
    if (
      !isDeepStrictEqual(rss, langUrls) ||
      !isDeepStrictEqual(atom, langUrls)
    ) {
      throw new Error(`RSS/Atom IDs do not match the ${lang} article index`);
    }
    for (const url of langUrls) urls.add(url);
  }
  const sitemap = xmlValues(
    read(`${prefix}/sitemap.xml`, "application/xml"),
    ["urlset", "url", "loc"],
    sitemapNs,
  );
  if (!isDeepStrictEqual(new Set(sitemap), urls))
    throw new Error("Sitemap does not match the article indices");
  if (blobs.size !== files.size)
    throw new Error("Snapshot includes unreferenced or unexpected files");

  const hash = createHash("sha256");
  for (const key of sortedKeys(blobs))
    hash.update(`${key}\0`).update(blobs.get(key)!.checksum);
  return { release: hash.digest("hex").slice(0, 24), blobs };
}

async function ensureBlob(
  aws: Aws,
  bucket: string,
  owner: string,
  key: string,
  blob: Blob,
  cacheControl: string,
) {
  const args = [
    "--bucket",
    bucket,
    "--expected-bucket-owner",
    owner,
    "--key",
    key,
  ];
  const checksum = blob.checksum.toString("base64");
  try {
    await aws(
      "s3api",
      "put-object",
      ...args,
      "--body",
      blob.file,
      "--content-type",
      blob.mime,
      "--cache-control",
      cacheControl,
      "--checksum-sha256",
      checksum,
      "--if-none-match",
      "*",
    );
  } catch (error) {
    if (!(error instanceof AwsError) || error.code !== "PreconditionFailed")
      throw error;
    const metadata = object(
      JSON.parse(
        await aws(
          "s3api",
          "head-object",
          ...args,
          "--checksum-mode",
          "ENABLED",
          "--output",
          "json",
        ),
      ),
    );
    if (
      metadata.ChecksumSHA256 !== checksum ||
      metadata.ContentType !== blob.mime ||
      metadata.CacheControl !== cacheControl
    ) {
      throw new Error(
        `Existing object conflicts with prepared release: ${key}`,
      );
    }
  }
}

export function blogPublishing(aws: Aws = awsCli("4")) {
  const store = (stage: Stage) => releaseStore(aws, stage, "blog");
  return {
    async upload(stage: Stage, directory: string, dryRun = false) {
      const { release, blobs } = prepareBlog(directory, stage);
      console.log(`${stage} blog release ${release}: ${blobs.size} objects`);
      if (dryRun) return release;
      const state = await store(stage);
      const owner = await aws(
        "sts",
        "get-caller-identity",
        "--query",
        "Account",
        "--output",
        "text",
      );
      const bucket = `${stage}-46ki75-web-s3-bucket-blog-cache`;
      const pending = blobs.entries();
      let failed = false;
      const results = await Promise.allSettled(
        Array.from({ length: 8 }, async () => {
          while (!failed) {
            const { done, value } = pending.next();
            if (done) return;
            const [key, blob] = value;
            const shared = key.startsWith(media);
            try {
              await ensureBlob(
                aws,
                bucket,
                owner,
                shared ? key : `blog-releases/${release}/${key}`,
                blob,
                shared ? immutable : mutable,
              );
            } catch (error) {
              failed = true;
              throw error;
            }
          }
        }),
      );
      const failure = results.find((result) => result.status === "rejected");
      if (failure) throw failure.reason;
      await state.markReady(await state.etag(), release);
      console.log(
        `Prepared ${stage} blog release ${release}; active pointer unchanged.`,
      );
      return release;
    },
    async active(stage: Stage) {
      return (await store(stage)).active();
    },
    async activate(stage: Stage, release: string, expect?: string) {
      if (release !== "legacy" && !isRelease(release))
        throw new Error("Expected a 24-character release ID or 'legacy'");
      const previous = await (await store(stage)).activate(release, expect);
      console.log(`${stage} blog release: ${previous} -> ${release}`);
    },
  };
}

if (import.meta.main) {
  await releaseCli({
    script: "packages/aws-release/src/publish-blog.ts",
    ...blogPublishing(),
  });
}
