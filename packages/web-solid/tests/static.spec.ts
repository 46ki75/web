import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createBuilder, preview } from "vite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { BlogResponse } from "../openapi/blog";

const root = fileURLToPath(new URL("../", import.meta.url));
const canonical = "https://static.example.test";
const slug = "static-100%.post";
const cache = "/cache/v3/blog";
const block = `${cache}/block-image/00000000-0000-0000-0000-000000000001/default`;
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
let scratch: string;
let output: string;
let sourceServer: Server;

function fixture(path: string, origin: string): Response {
  const locale = path.endsWith("/ja.json") ? "ja" : "en";
  const post = {
    slug,
    title: locale === "en" ? "Static English article" : "静的な日本語の記事",
    description: "A static test article",
    created_at: "2026-01-01",
    updated_at: "2026-01-02",
    tag_ids: [],
    status: "Published",
    featured: true,
    keywords: ["fixture"],
    notion_url: "https://example.test/fixture",
    page_id: "1234",
  } satisfies BlogResponse;
  const draft = { ...post, slug: "hidden-draft", status: "Draft" };
  if (path.startsWith(`${cache}/list/`)) {
    return Response.json(locale === "en" ? [post, draft] : [post]);
  }
  if (
    path.startsWith(`${cache}/article/${encodeURIComponent(slug)}/contents/`)
  ) {
    return Response.json({
      meta: post,
      surface: {
        components: {
          root: {
            id: "root",
            component: "Column",
            children: ["paragraph", "table", "image"],
          },
          paragraph: {
            id: "paragraph",
            component: "Paragraph",
            children: ["body"],
          },
          body: {
            id: "body",
            component: "RichText",
            text: `Build-time A2UI body (${locale})`,
          },
          table: { id: "table", component: "Table", header: ["row"], body: [] },
          row: { id: "row", component: "TableRow", children: ["cell"] },
          cell: { id: "cell", component: "TableCell", children: ["text"] },
          text: { id: "text", component: "RichText", text: "Heading" },
          image: {
            id: "image",
            component: "BlockImage",
            src: block,
            srcset: `${block} 500w`,
          },
        },
      },
    });
  }
  if (path.includes("/og-image/")) {
    return new Response("cover", { headers: { "Content-Type": "image/webp" } });
  }
  if (path === block || path === "/badge.svg") {
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
  }
  if (path === `${cache}/tags.json`) {
    return Response.json([]);
  }
  if (path.includes("/feed/")) {
    return new Response(
      path.endsWith(".json")
        ? JSON.stringify({ home_page_url: `${origin}/blog` })
        : `<feed>${origin}/blog</feed>`,
    );
  }
  if (path === "/badges.json") {
    return Response.json({
      data: [
        {
          id: "fixture",
          issued_at_date: "2026-01-02",
          badge_template: {
            name: "Static fixture badge",
            description: "A test badge",
            url: "https://example.test/badge",
            image_url: `${origin}/badge.svg`,
          },
        },
      ],
    });
  }
  return new Response(null, { status: 404 });
}

beforeAll(async () => {
  scratch = await mkdtemp(join(root, "node_modules/.site-test-"));
  output = join(scratch, "client");
  sourceServer = createServer((req, res) => {
    const origin = `http://${req.headers.host}`;
    const response = fixture(new URL(req.url ?? "/", origin).pathname, origin);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    void response.arrayBuffer().then((body) => res.end(Buffer.from(body)));
  });
  const origin = await new Promise<string>((resolve, reject) => {
    sourceServer.once("error", reject);
    sourceServer.listen(0, "127.0.0.1", () => {
      const address = sourceServer.address();
      if (address && typeof address !== "string") {
        resolve(`http://127.0.0.1:${address.port}`);
      } else {
        reject(new Error("Fixture server did not bind a TCP socket"));
      }
    });
  });
  vi.stubEnv("VITE_SITE_URL", canonical);
  vi.stubEnv("BLOG_SNAPSHOT_ORIGIN", origin);
  vi.stubEnv("CREDLY_SNAPSHOT_URL", `${origin}/badges.json`);
  try {
    const builder = await createBuilder({
      root,
      logLevel: "warn",
      plugins: [
        {
          name: "test-build-directories",
          configEnvironment(name) {
            return {
              build: {
                outDir: name === "ssr" ? join(scratch, "server") : output,
              },
            };
          },
        },
      ],
    });
    await builder.buildApp();
  } finally {
    vi.unstubAllEnvs();
    // Nothing in the artifact should require the snapshot source after this point.
    await new Promise<void>((resolve) => sourceServer.close(() => resolve()));
  }
}, 120_000);

afterAll(async () => {
  if (scratch) {
    await rm(scratch, { recursive: true, force: true });
  }
});

const file = (pathname: string) =>
  readFile(join(output, decodeURIComponent(pathname)), "utf8");

describe("portable static artifact", () => {
  it("preserves manual theme switching in the generated CSS", () => {
    expect(() =>
      execFileSync(process.execPath, [
        join(root, "scripts/verify-theme-css.mjs"),
        output,
      ]),
    ).not.toThrow();
  });

  it.each([
    ["/index.html", "en", "Ikuma Yamashita"],
    ["/privacy/index.html", "en", "Privacy Policy"],
    ["/ja/index.html", "ja", "Ikuma Yamashita"],
    ["/ja/privacy/index.html", "ja", "プライバシーポリシー"],
    ["/blog/search/index.html", "en", "Blog Search"],
    ["/ja/blog/search/index.html", "ja", "Blog Search"],
  ])("prerenders %s", async (path, locale, title) => {
    const html = await file(path);
    expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang="${locale}"`));
    expect(html).toMatch(
      new RegExp(`<title[^>]*>${title} \\| FineNight</title>`),
    );
    expect(html).toContain('src="/build/');
  });

  it.each([
    ["", "en", "Static English article"],
    ["/ja", "ja", "静的な日本語の記事"],
  ])(
    "prerenders A2UI, metadata and data for %s",
    async (prefix, locale, title) => {
      const path = `/blog/article/${encodeURIComponent(slug)}`;
      const html = await file(`${prefix}${path}/index.html`);
      expect(html).toContain(
        `rel="canonical" href="${canonical}${prefix}${path}"`,
      );
      expect(html).toContain(`hreflang="en" href="${canonical}${path}"`);
      expect(html).toContain(`hreflang="ja" href="${canonical}/ja${path}"`);
      expect(html).toContain(`property="og:title" content="${title}"`);
      expect(html).toContain('"@type":"Article"');
      const cover = `/content${path}/${locale}.webp`;
      expect(html).toContain(
        `property="og:image" content="${canonical}${cover}"`,
      );
      await expect(file(cover)).resolves.toBe("cover");
      expect(html).toContain(`data-a2ui-surface-id="blog-${locale}-${slug}"`);
      expect(html).toContain(`Build-time A2UI body (${locale})`);
      expect(html).toMatch(/<tr[^>]*data-a2ui-component-id="row"/);
      expect(html).toMatch(/<th[^>]*data-a2ui-component-id="cell"/);
      const image = html.match(/src="(\/content\/media\/[^".]+\.svg)"/)?.[1];
      expect(image).toBeDefined();
      await expect(file(image!)).resolves.toBe(svg);
      const json = await file(`/content${path}/${locale}.json`);
      expect(json).toContain(title);
      expect(json).toContain(image);
      expect(json).not.toContain(block);
    },
  );

  it("includes redirects and a dedicated 404 without publishing draft routes", async () => {
    await expect(file("/about/index.html")).resolves.toContain("url=/");
    await expect(file("/en/privacy/index.html")).resolves.toContain(
      "url=/privacy",
    );
    await expect(file("/ja/about/index.html")).resolves.toContain("url=/ja");
    await expect(file("/404.html")).resolves.toContain("Not Found");
    await expect(
      file("/blog/article/hidden-draft/index.html"),
    ).rejects.toHaveProperty("code", "ENOENT");
    await expect(file("/content/blog/list/en.json")).resolves.not.toContain(
      "hidden-draft",
    );
  });

  it("serves direct article URLs and an actual 404 from static files", async () => {
    const server = await preview({
      root,
      build: { outDir: output },
      preview: { host: "127.0.0.1", port: 0, strictPort: true },
    });
    try {
      const address = server.httpServer.address();
      if (address === null || typeof address === "string") {
        throw new Error("Preview did not bind a TCP socket");
      }
      const origin = `http://127.0.0.1:${address.port}`;
      const article = await fetch(
        `${origin}/ja/blog/article/${encodeURIComponent(slug)}`,
        { redirect: "manual" },
      );
      expect(article.status).toBe(200);
      await expect(article.text()).resolves.toContain(
        "Build-time A2UI body (ja)",
      );
      const missing = await fetch(`${origin}/ja/blog/article/unknown`);
      expect(missing.status).toBe(404);
      await expect(missing.text()).resolves.toContain("<h1>Not Found</h1>");
    } finally {
      await server.close();
    }
  });

  it("bundles Credly badges and standalone crawler documents", async () => {
    const badges = await file("/content/badges.json");
    expect(badges).toContain("Static fixture badge");
    const badgeImage = badges.match(
      /"image_url":"(\/content\/media\/[^".]+\.svg)"/,
    )?.[1];
    expect(badgeImage).toBeDefined();
    await expect(file(badgeImage!)).resolves.toBe(svg);
    await expect(file("/robots.txt")).resolves.toContain(
      `Sitemap: ${canonical}/sitemap-index.xml`,
    );
    await expect(file("/sitemap-index.xml")).resolves.toContain(
      `${canonical}/sitemap-blog.xml`,
    );
    await expect(file("/sitemap.xml")).resolves.not.toContain("/blog/search");
    await expect(file("/sitemap-blog.xml")).resolves.toContain(
      `${canonical}/ja/blog/article/${encodeURIComponent(slug)}`,
    );
    await expect(file(`${cache}/feed/atom/ja.xml`)).resolves.toContain(
      `${canonical}/blog`,
    );
    await expect(file(`${cache}/feed/rss/en.xml`)).resolves.toContain(
      `${canonical}/blog`,
    );
    await expect(file(`${cache}/feed/json-feed/en.json`)).resolves.toContain(
      `${canonical}/blog`,
    );
  });
});
