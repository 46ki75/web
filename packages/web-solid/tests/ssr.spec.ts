import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

type LambdaHandler = (
  event: Record<string, unknown>,
  context: Record<string, unknown>,
) => Promise<LambdaResponse>;

let handler: LambdaHandler;

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeAll(async () => {
  const entry = new URL("../.output/server/index.mjs", import.meta.url).href;
  const module = (await import(/* @vite-ignore */ entry)) as {
    handler: LambdaHandler;
  };
  handler = module.handler;
});

const invoke = async (path: string, accept = "text/html") => {
  const url = new URL(path, "https://dev-www.ikuma.cloud");
  return handler(
    {
      version: "2.0",
      routeKey: "$default",
      rawPath: url.pathname,
      rawQueryString: url.search.slice(1),
      headers: {
        accept,
        host: url.host,
        "x-forwarded-proto": "https",
      },
      requestContext: {
        domainName: url.host,
        http: {
          method: "GET",
          path: url.pathname,
          protocol: "HTTP/1.1",
          sourceIp: "127.0.0.1",
          userAgent: "vitest",
        },
      },
      isBase64Encoded: false,
    },
    {},
  );
};

describe("production SSR handler", () => {
  it.each([
    ["/", "en", "Ikuma Yamashita | FineNight"],
    ["/privacy", "en", "Privacy Policy | FineNight"],
    ["/ja/", "ja", "Ikuma Yamashita | FineNight"],
    ["/ja/privacy", "ja", "プライバシーポリシー | FineNight"],
  ])("renders %s in %s", async (path, locale, title) => {
    const response = await invoke(path);

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain(`<html lang="${locale}">`);
    expect(response.body).toMatch(new RegExp(`<title[^>]*>${title}</title>`));
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["cache-control"]).toBe(
      "public, max-age=600, s-maxage=31536000",
    );
  });

  it("renders localized canonical, alternate, Open Graph, and JSON-LD metadata", async () => {
    const response = await invoke("/ja/privacy");

    expect(response.body).toContain(
      'rel="canonical" href="https://dev-www.ikuma.cloud/ja/privacy"',
    );
    expect(response.body).toContain(
      'hreflang="en" href="https://dev-www.ikuma.cloud/privacy"',
    );
    expect(response.body).toContain(
      'hreflang="ja" href="https://dev-www.ikuma.cloud/ja/privacy"',
    );
    expect(response.body).toContain('property="og:locale" content="ja_JP"');
    expect(response.body).toContain('type="application/ld+json"');
    expect(response.body).toContain('"inLanguage":"ja"');
  });

  it("redirects explicit English and legacy About paths", async () => {
    const english = await invoke("/en/privacy?ref=test");
    const about = await invoke("/ja/about?ref=test");

    expect(english.statusCode).toBe(308);
    expect(english.headers.location).toBe("/privacy?ref=test");
    expect(about.statusCode).toBe(308);
    expect(about.headers.location).toBe("/ja/?ref=test");
  });

  it("returns 404 for unsupported locale prefixes", async () => {
    const response = await invoke("/fr/privacy");

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Not Found");
  });

  it("returns a non-cacheable 404 for missing articles", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/cache/v3/blog/tags.json")) {
          return Response.json([]);
        }
        if (url.includes("/cache/v3/blog/list/")) {
          return Response.json([]);
        }
        return new Response(null, { status: 404 });
      }),
    );

    const response = await invoke("/blog/article/missing-vitest");

    expect(response.statusCode).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toContain("Not Found");
    expect(response.body).toContain('content="noindex,follow"');
  });

  it("server-renders the A2UI article body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/cache/v3/blog/tags.json")) {
          return Response.json([]);
        }
        if (url.includes("/cache/v3/blog/list/")) {
          return Response.json([]);
        }
        return Response.json({
          meta: {
            slug: "a2ui-ssr-vitest",
            title: "A2UI SSR article",
            description: "A2UI SSR description",
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
            tag_ids: [],
          },
          surface: {
            components: {
              root: {
                component: "Column",
                id: "root",
                children: ["paragraph"],
              },
              paragraph: {
                component: "Paragraph",
                id: "paragraph",
                children: ["body"],
              },
              body: {
                component: "RichText",
                id: "body",
                text: "A2UI article body rendered on the server",
              },
            },
          },
        });
      }),
    );

    const response = await invoke("/blog/article/a2ui-ssr-vitest");

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain(
      'data-a2ui-surface-id="blog-en-a2ui-ssr-vitest"',
    );
    expect(response.body).toContain('data-a2ui-component-id="root"');
    expect(response.body).toContain("A2UI article body rendered on the server");
  });

  it("does not leak locale state across concurrent requests", async () => {
    const paths = Array.from({ length: 10 }, (_, index) =>
      index % 2 === 0 ? "/privacy" : "/ja/privacy",
    );
    const responses = await Promise.all(paths.map((path) => invoke(path)));

    responses.forEach((response, index) => {
      const locale = index % 2 === 0 ? "en" : "ja";
      expect(response.body).toContain(`<html lang="${locale}">`);
    });
  });

  it("keeps locale-keyed article queries isolated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/cache/v3/blog/tags.json")) {
          return Response.json([]);
        }
        if (url.includes("/cache/v3/blog/list/")) {
          return Response.json([]);
        }
        const locale = url.endsWith("/ja.json") ? "ja" : "en";
        return Response.json({
          meta: {
            slug: "locale-isolation-vitest",
            title: locale === "ja" ? "日本語の記事" : "English article",
            description: `${locale} description`,
            created_at: "2026-01-01",
            updated_at: "2026-01-02",
            tag_ids: [],
          },
          surface: { components: {} },
        });
      }),
    );

    const [english, japanese] = await Promise.all([
      invoke("/blog/article/locale-isolation-vitest"),
      invoke("/ja/blog/article/locale-isolation-vitest"),
    ]);

    expect(english.statusCode).toBe(200);
    expect(english.body).toContain("English article | FineNight");
    expect(english.body).toContain('<html lang="en">');
    expect(japanese.statusCode).toBe(200);
    expect(japanese.body).toContain("日本語の記事 | FineNight");
    expect(japanese.body).toContain('<html lang="ja">');
  });

  it("emits paths that match the deployed static asset directory", async () => {
    const response = await invoke("/privacy");
    const touchIcon = response.body.match(
      /rel="apple-touch-icon" href="([^"]+)"/,
    )?.[1];

    expect(response.body).toContain("/build/");
    expect(response.body).not.toContain("/_build/assets/");
    expect(touchIcon).toMatch(/^\/build\//);
    await expect(
      access(
        join(
          fileURLToPath(new URL("../.output/public", import.meta.url)),
          touchIcon!,
        ),
      ),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["/robots.txt", "text/plain", "Sitemap:"],
    ["/sitemap.xml", "application/xml", "<urlset"],
    ["/sitemap-index.xml", "application/xml", "<sitemapindex"],
  ])("serves %s", async (path, contentType, marker) => {
    const response = await invoke(path, contentType);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain(contentType);
    expect(response.body).toContain(marker);
  });
});
