import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { SitemapIndexStream, SitemapStream, streamToPromise } from "sitemap";

import type {
  BlogArticleSnapshot,
  BlogSnapshotEntry,
  BlogTagSnapshot,
} from "../src/data/blog-snapshot";
import {
  articlePath,
  badgesPath,
  contentRoot,
  credlySource,
  isArticleSlug,
  listPath,
  ogImageUrl,
  tagsPath,
  type CredlyBadgeData,
} from "../src/data/content-paths";
import { localizePath, locales, type Locale } from "../src/i18n/locale";

const blogCache = "/cache/v3/blog";
const fixedPages = ["/", "/privacy", "/blog", "/blog/search"];
const imageExtensions: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

async function download(url: URL) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(
      `Cannot snapshot ${url.origin}${url.pathname}: HTTP ${response.status}`,
    );
  }
  return {
    body: await response.arrayBuffer(),
    type: response.headers.get("content-type")?.split(";")[0],
  };
}

async function fetchJson<T>(url: URL): Promise<T> {
  const { body } = await download(url);
  return JSON.parse(new TextDecoder().decode(body)) as T;
}

// A bounded queue keeps a large article or badge collection from opening an HTTP connection per image.
async function mapConcurrent<T, R>(
  values: T[],
  fn: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  const workers = await Promise.allSettled(
    Array.from({ length: Math.min(8, values.length) }, async () => {
      while (next < values.length) {
        const index = next++;
        results[index] = await fn(values[index]);
      }
    }),
  );
  const failed = workers.find((worker) => worker.status === "rejected");
  if (failed) {
    throw failed.reason;
  }
  return results;
}

export async function prepareSiteContent({
  directory,
  siteOrigin,
  blogOrigin,
  badgesSource = credlySource,
}: {
  directory: string;
  siteOrigin: string;
  blogOrigin: string;
  badgesSource?: string;
}) {
  const blogUrl = (path: string) => new URL(`${blogCache}${path}`, blogOrigin);
  const save = async (path: string, data: string | Uint8Array) => {
    const file = `${directory}${decodeURIComponent(path)}`;
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, data);
  };
  const saveJson = (path: string, data: unknown) =>
    save(path, JSON.stringify(data));
  const copy = async (url: URL, path: string, expectedType: string) => {
    const { body, type } = await download(url);
    if (type !== expectedType) {
      throw new Error(
        `Expected ${expectedType} for ${url.pathname}, got ${type}`,
      );
    }
    await save(path, new Uint8Array(body));
  };
  const assets = new Map<string, Promise<string>>();
  function mirrorImage(value: string) {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) {
      throw new Error(`Unsupported image URL protocol: ${url.protocol}`);
    }
    let pending = assets.get(url.href);
    if (!pending) {
      pending = (async () => {
        const { body, type } = await download(url);
        const extension = type && imageExtensions[type];
        if (!extension) {
          throw new Error(
            `Unsupported image format ${type} for ${url.pathname}`,
          );
        }
        const hash = createHash("sha256")
          .update(new Uint8Array(body))
          .digest("hex");
        const path = `${contentRoot}/media/${hash}.${extension}`;
        await save(path, new Uint8Array(body));
        return path;
      })();
      assets.set(url.href, pending);
    }
    return pending;
  }

  const [lists, tags, badges] = await Promise.all([
    Promise.all(
      locales.map(async (locale) => ({
        locale,
        posts: (
          await fetchJson<BlogSnapshotEntry[]>(blogUrl(`/list/${locale}.json`))
        ).filter(({ status }) => status === "Published"),
      })),
    ),
    fetchJson<BlogTagSnapshot[]>(blogUrl("/tags.json")),
    fetchJson<{ data: CredlyBadgeData[] }>(new URL(badgesSource)),
  ]);

  const articles = lists.flatMap(({ locale, posts }) => {
    const slugs = new Set<string>();
    for (const { slug } of posts) {
      if (!isArticleSlug(slug) || slugs.has(slug)) {
        throw new Error(
          `Invalid or duplicate article slug for ${locale}: ${slug}`,
        );
      }
      slugs.add(slug);
    }
    return posts.map(({ slug }) => ({
      slug,
      locale,
      path: `/blog/article/${encodeURIComponent(slug)}`,
    }));
  });

  const articleLocales = new Map<string, Locale[]>();
  for (const { slug, locale } of articles) {
    const available = articleLocales.get(slug) ?? [];
    available.push(locale);
    articleLocales.set(slug, available);
  }

  const articleImage =
    /(?:\/cache\/v3\/blog\/block-image\/[\da-f-]+\/(?:default|small|medium|large)|https:\/\/app\.notion\.com\/icons\/[\w-]+\.svg)(?=["\s])/g;
  const savedArticles = await mapConcurrent(
    articles,
    async ({ slug, locale }) => {
      const contents = await fetchJson<BlogArticleSnapshot>(
        blogUrl(`/article/${encodeURIComponent(slug)}/contents/${locale}.json`),
      );
      if (
        contents.meta.slug !== slug ||
        contents.meta.status !== "Published" ||
        !contents.surface
      ) {
        throw new Error(`Invalid article snapshot for ${locale}/${slug}`);
      }
      return {
        slug,
        locale,
        contents,
        surface: JSON.stringify(contents.surface),
      };
    },
  );
  // The publisher uses extensionless keys for both raster and vector images.
  // Give the bundled A2UI src/srcset files extensions based on their MIME type.
  const imagePaths = new Set(
    savedArticles.flatMap(({ surface }) => surface.match(articleImage) ?? []),
  );
  const images = new Map(
    await mapConcurrent(
      [...imagePaths],
      async (path) =>
        [path, await mirrorImage(new URL(path, blogOrigin).href)] as const,
    ),
  );
  await mapConcurrent(
    savedArticles,
    async ({ slug, locale, contents, surface }) => {
      const rewritten = surface.replace(
        articleImage,
        (path) => images.get(path) ?? path,
      );
      await saveJson(articlePath(slug, locale), {
        ...contents,
        availableLocales: articleLocales.get(slug),
        surface: JSON.parse(rewritten) as unknown,
      });
      await copy(
        blogUrl(`/article/${encodeURIComponent(slug)}/og-image/${locale}`),
        ogImageUrl(slug, locale),
        "image/webp",
      );
    },
  );

  await saveJson(
    tagsPath,
    await mapConcurrent(tags, async (tag) => ({
      ...tag,
      icon_url: tag.icon_url ? await mirrorImage(tag.icon_url) : null,
    })),
  );
  await saveJson(
    badgesPath,
    await mapConcurrent(
      badges.data,
      async ({ id, issued_at_date, expires_at_date, badge_template }) => ({
        id,
        issued_at_date,
        expires_at_date,
        badge_template: {
          name: badge_template.name,
          description: badge_template.description,
          url: badge_template.url,
          image_url: await mirrorImage(badge_template.image_url),
        },
      }),
    ),
  );

  await Promise.all(
    lists.map(({ locale, posts }) =>
      saveJson(
        listPath(locale),
        posts.sort((a, b) => b.created_at.localeCompare(a.created_at)),
      ),
    ),
  );
  await mapConcurrent(
    locales.flatMap((locale) => [
      `/feed/rss/${locale}.xml`,
      `/feed/atom/${locale}.xml`,
      `/feed/json-feed/${locale}.json`,
    ]),
    async (path) => {
      const { body } = await download(blogUrl(path));
      const feed = new TextDecoder()
        .decode(body)
        .replaceAll(`${blogOrigin}/`, `${siteOrigin}/`);
      await save(`${blogCache}${path}`, feed);
    },
  );

  const pages = [
    ...fixedPages.flatMap((path) =>
      locales.map((locale) => ({ path, locale })),
    ),
    ...articles,
  ];
  const writeSitemap = async (
    filename: string,
    entries: { path: string; locale: Locale }[],
  ) => {
    const alternates = new Map<string, Locale[]>();
    for (const { path, locale } of entries) {
      const existing = alternates.get(path) ?? [];
      existing.push(locale);
      alternates.set(path, existing);
    }
    const links = entries.map(({ path, locale }) => {
      const available = alternates.get(path) ?? [];
      return {
        url: localizePath(path, locale),
        links: [
          ...(available.includes("en")
            ? [{ lang: "x-default", url: localizePath(path, "en") }]
            : []),
          ...available.map((lang) => ({ lang, url: localizePath(path, lang) })),
        ],
      };
    });
    const xml = await streamToPromise(
      Readable.from(links).pipe(new SitemapStream({ hostname: siteOrigin })),
    );
    await save(filename, xml);
  };
  // Keep search out of the sitemap, and preserve the old blog sitemap URL for consumers.
  await writeSitemap(
    "/sitemap.xml",
    pages.filter(
      ({ path }) => fixedPages.includes(path) && path !== "/blog/search",
    ),
  );
  await writeSitemap("/sitemap-blog.xml", articles);
  await writeSitemap(`${blogCache}/sitemap.xml`, articles);
  const index = new SitemapIndexStream();
  index.write({ url: `${siteOrigin}/sitemap.xml` });
  index.write({ url: `${siteOrigin}/sitemap-blog.xml` });
  index.end();
  await save("/sitemap-index.xml", await streamToPromise(index));
  await save(
    "/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap-index.xml\n`,
  );
  await save(
    "/404.html",
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not Found | FineNight</title><main><h1>Not Found</h1><p><a href="/">Home</a> · <a lang="ja" href="/ja/">ホーム</a></p></main></html>\n',
  );

  const paths = [
    ...pages.map(({ path, locale }) => localizePath(path, locale)),
    ...pages
      .filter(({ locale }) => locale === "en")
      .map(({ path }) => `/en${path}`),
    "/about",
    "/ja/about",
    "/en/about",
  ];
  return paths.map((path) => ({
    path,
    // A route can contain a dot or a percent-encoded slug; the static host
    // decodes the URL when looking up the directory on disk.
    filename: `${decodeURIComponent(path).replace(/^\//, "").replace(/\/$/, "")}${path === "/" ? "" : "/"}index.html`,
  }));
}
