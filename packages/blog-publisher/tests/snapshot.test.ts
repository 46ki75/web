import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Client } from "@notionhq/client";
import {
  blogCache,
  type BlogArticleSnapshot,
  type BlogSnapshotEntry,
  type BlogTagSnapshot,
} from "@web/blog-snapshot";
import { Surface, type SurfaceJSON } from "n2a2ui";
import sharp from "sharp";
import { snapshotServer, writeSnapshot } from "../src/local.ts";
import { imageDownloader, snapshotImages } from "../src/media.ts";
import { notionSettings, notionSource } from "../src/notion.ts";
import { generateSnapshot } from "../src/snapshot.ts";

const media =
  "https://prod-files-secure.s3.us-west-2.amazonaws.com/private/input?X-Amz-Signature=fake-secret";
const settings = { token: "fixture-only", articles: "articles", tags: "tags" };
const slug = "100%.post";
const text = (content: string) => ({
  type: "text",
  text: { content, link: null },
  plain_text: content,
  href: null,
  annotations: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    color: "default",
  },
});
const rich = (value: string) => ({
  type: "rich_text",
  rich_text: [text(value)],
});
const relation = (...ids: string[]) => ({
  type: "relation",
  relation: ids.map((id) => ({ id })),
});
const date = (start: string) => ({ type: "date", date: { start } });
const page = (id: string, properties: Record<string, unknown>) => ({
  object: "page",
  id,
  url: `https://www.notion.so/${id}`,
  in_trash: false,
  properties,
});
const list = (results: unknown[], nextCursor: string | null = null) =>
  Response.json({
    object: "list",
    results,
    has_more: nextCursor !== null,
    next_cursor: nextCursor,
  });

function fixture({ invalidSlug = slug } = {}) {
  const seen = new Set<string>();
  const client = new Client({
    auth: settings.token,
    baseUrl: "https://notion.example.test",
    logger: () => {},
    fetch: async (input, init) => {
      assert(init);
      assert.equal(
        new Headers(init.headers).get("authorization"),
        `Bearer ${settings.token}`,
      );
      const url = new URL(String(input));
      const body = typeof init.body === "string" ? JSON.parse(init.body) : {};
      seen.add(
        `${url.pathname}:${url.searchParams.get("start_cursor") ?? body.start_cursor ?? "first"}`,
      );
      if (url.pathname === "/v1/data_sources/articles/query") {
        assert.deepEqual(body.filter, {
          property: "status",
          status: { equals: "Published" },
        });
        return body.start_cursor
          ? list([
              page("master", {
                slug: rich(invalidSlug),
                featured: { type: "checkbox", checkbox: true },
                status: { type: "status", status: { name: "Published" } },
                tag_ids: relation("tag"),
                article_en: relation("en-id"),
                article_ja: relation("ja-id"),
              }),
            ])
          : list([], "second");
      }
      if (url.pathname === "/v1/data_sources/tags/query") {
        return list([
          {
            ...page("tag", {
              name_en: rich("Cloud"),
              name_ja: rich("クラウド"),
            }),
            icon: { type: "file", file: { url: media } },
          },
        ]);
      }
      const match = /^\/v1\/pages\/(en|ja)-id$/.exec(url.pathname);
      if (match) {
        return Response.json({
          ...page(`${match[1]}-id`, {
            title: {
              type: "title",
              title: [text(match[1] === "ja" ? "日本語" : "Fish & Chips")],
            },
            description: rich("Test <description>"),
            keywords: rich("A, B"),
            created_at: date("2026-01-02"),
            updated_at: date("2026-01-03T12:00:00.120+00:00"),
          }),
          cover: { type: "file", file: { url: media } },
        });
      }
      const blocks = /^\/v1\/blocks\/(en|ja)-id\/children$/.exec(url.pathname);
      if (blocks) {
        const base = {
          object: "block",
          has_children: false,
          archived: false,
          in_trash: false,
        };
        return url.searchParams.has("start_cursor")
          ? list([
              {
                ...base,
                id: "image",
                type: "image",
                image: { caption: [], type: "file", file: { url: media } },
              },
            ])
          : list(
              [
                {
                  ...base,
                  id: "paragraph",
                  type: "paragraph",
                  paragraph: {
                    color: "default",
                    rich_text: [text(`Body ${blocks[1]}`)],
                  },
                },
              ],
              "second",
            );
      }
      throw new Error(`Unexpected fixture path ${url.pathname}`);
    },
  });
  return { seen, source: notionSource(settings, client) };
}

test("converts paginated Notion pages into consumable, localized v3 snapshots", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "blog-publisher-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = join(root, "snapshot");
  const image = await sharp({
    create: { width: 1000, height: 200, channels: 3, background: "orange" },
  })
    .png()
    .toBuffer();
  const { source, seen } = fixture();
  const origin = "https://www.ikuma.cloud";
  const download = imageDownloader([], async (input, init) => {
    assert.equal(String(input), media);
    assert.equal(new Headers(init?.headers).get("authorization"), null);
    return new Response(new Uint8Array(image));
  });
  const result = await writeSnapshot(target, (save) =>
    generateSnapshot({ source, save, siteOrigin: origin, download }),
  );
  assert.deepEqual(result, { en: 1, ja: 1, tags: 1 });
  assert(seen.has("/v1/data_sources/articles/query:second"));
  assert(seen.has("/v1/blocks/ja-id/children:second"));
  const server = snapshotServer(target).listen(0, "127.0.0.1");
  t.after(() => {
    server.close();
  });
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  const get = (path: string, init?: RequestInit) =>
    fetch(`http://127.0.0.1:${address.port}${path}`, init);
  for (const locale of ["en", "ja"]) {
    const article = `${blogCache}/article/${encodeURIComponent(slug)}`;
    const response = await get(`${article}/contents/${locale}.json`);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert(!body.includes("fake-secret"));
    assert(body.includes(`Body ${locale}`));
    const { meta, surface } = JSON.parse(body) as BlogArticleSnapshot & {
      surface: SurfaceJSON;
    };
    const list = (await (
      await get(`${blogCache}/list/${locale}.json`)
    ).json()) as BlogSnapshotEntry[];
    assert.deepEqual(list, [meta]);
    assert.equal(meta.updated_at, "2026-01-03T12:00:00.12Z");
    assert.deepEqual(meta.keywords, ["A", "B"]);
    const component = Object.values(surface.components).find(
      (c) => c.component === "BlockImage",
    );
    assert(
      component?.component === "BlockImage" &&
        typeof component.src === "string",
    );
    assert.match(
      component.src,
      /^\/cache\/v3\/blog\/block-image\/[a-f0-9]{64}\/default$/,
    );
    assert.match(
      component.srcset ?? "",
      /\/small 500w, .*\/medium 800w, .*\/default 1000w$/,
    );
    assert.equal(
      (await get(component.src, { method: "HEAD" })).headers.get(
        "content-type",
      ),
      "image/webp",
    );
    const cover = await get(`${article}/og-image/${locale}`);
    assert.equal(cover.headers.get("content-type"), "image/webp");
    assert.equal(
      (await sharp(Buffer.from(await cover.arrayBuffer())).metadata()).width,
      1000,
    );
    const prefix = locale === "ja" ? "/ja" : "";
    assert(
      (
        await (await get(`${blogCache}/feed/rss/${locale}.xml`)).text()
      ).includes(`${origin}${prefix}/blog/article/${encodeURIComponent(slug)}`),
    );
  }
  const [tag] = (await (
    await get(`${blogCache}/tags.json`)
  ).json()) as BlogTagSnapshot[];
  assert(tag.icon_url?.startsWith(blogCache));
  assert.equal(
    (await get(tag.icon_url!)).headers.get("content-type"),
    "image/webp",
  );
  const sitemap = await (await get(`${blogCache}/sitemap.xml`)).text();
  assert(
    sitemap.includes('hreflang="x-default"') &&
      sitemap.includes("/ja/blog/article/100%25.post"),
  );
  assert.equal(
    (await get(`${blogCache}/article/%2e%2e%2fsecret/contents/en.json`)).status,
    404,
  );
});

test("rejects invalid or partial input without publishing a partial directory", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "blog-publisher-failed-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = join(root, "snapshot");
  const { source } = fixture({ invalidSlug: "../not-public" });
  await assert.rejects(
    writeSnapshot(target, (save) =>
      generateSnapshot({
        source,
        save,
        siteOrigin: "https://www.ikuma.cloud",
        download: imageDownloader(),
      }),
    ),
    /invalid or duplicate slug/,
  );
  await assert.rejects(
    writeSnapshot(target, async (save) => {
      await save(`${blogCache}/list/en.json`, "[]");
      throw new Error("after writing");
    }),
    /after writing/,
  );
  await assert.rejects(stat(target), { code: "ENOENT" });
  assert.deepEqual(await readdir(root), []);
  assert.throws(
    () => notionSettings({ NOTION_TOKEN: "secret-example" }),
    (error: Error) =>
      error.message.includes("NOTION_TAG_DATA_SOURCE_ID") &&
      !error.message.includes("secret-example"),
  );
});

test("rejects expiring links and unsupported hosted attachments", async () => {
  const images = snapshotImages(
    async () => assert.fail("nothing should be written"),
    async () => assert.fail("nothing should be downloaded"),
  );
  await assert.rejects(
    images.surface(
      new Surface("root", [
        ["root", { id: "root", component: "File", src: media }],
      ]),
    ),
    /without a durable copy/,
  );
  await assert.rejects(
    images.surface(
      new Surface("root", [
        [
          "root",
          { id: "root", component: "LinkText", href: media, text: "download" },
        ],
      ]),
    ),
    /expiring bookmark or link/,
  );
});

test("does not send media requests to unapproved hosts, including redirects", async () => {
  let calls = 0;
  const download = imageDownloader([], async (_url, init) => {
    calls++;
    assert.equal(init?.redirect, "manual");
    return new Response(null, {
      status: 302,
      headers: { location: "http://127.0.0.1/private?signature=secret" },
    });
  });
  await assert.rejects(
    download("https://s3.us-west-2.amazonaws.com.attacker.test/image"),
    /allowlist/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    download(media),
    (error: Error) =>
      error.message.includes("allowlist") && !error.message.includes("secret"),
  );
  assert.equal(calls, 1);
});
