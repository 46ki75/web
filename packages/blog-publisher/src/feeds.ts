import {
  blogCache,
  blogLocales,
  type BlogLocale,
  type BlogSnapshotEntry,
} from "@web/blog-snapshot";
import type { Save } from "./media.ts";

const title = "Ikuma's Blog";
const description =
  "Ikuma's personal blog about software development and technology.";
const preamble = '<?xml version="1.0" encoding="UTF-8"?>';
const xml = (text: string) =>
  text
    .replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[character]!,
    )
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, "");
const blogUrl = (origin: string, locale: BlogLocale) =>
  `${origin}${locale === "ja" ? "/ja" : ""}/blog`;
const articleUrl = (origin: string, locale: BlogLocale, slug: string) =>
  `${blogUrl(origin, locale)}/article/${encodeURIComponent(slug)}`;

export async function saveFeeds(
  save: Save,
  origin: string,
  lists: Record<BlogLocale, BlogSnapshotEntry[]>,
) {
  const latest = (posts: BlogSnapshotEntry[]) =>
    posts.reduce((max, post) => Math.max(max, Date.parse(post.updated_at)), 0);
  for (const locale of blogLocales) {
    const posts = lists[locale];
    const blog = blogUrl(origin, locale);
    const feed = (format: string, extension: string) =>
      `${blogCache}/feed/${format}/${locale}.${extension}`;
    const items = posts.map((post) => {
      const url = xml(articleUrl(origin, locale, post.slug));
      return `<item><title>${xml(post.title)}</title><link>${url}</link><description>${xml(post.description)}</description><pubDate>${new Date(post.created_at).toUTCString()}</pubDate></item>`;
    });
    await save(
      feed("rss", "xml"),
      `${preamble}<rss version="2.0"><channel><title>${xml(title)}</title><link>${xml(blog)}</link><description>${xml(description)}</description><language>${locale}</language>${items.join("")}</channel></rss>`,
    );
    const entries = posts.map((post) => {
      const url = xml(articleUrl(origin, locale, post.slug));
      return `<entry><title>${xml(post.title)}</title><id>${url}</id><link href="${url}"/><summary>${xml(post.description)}</summary><published>${xml(post.created_at)}</published><updated>${xml(post.updated_at)}</updated></entry>`;
    });
    await save(
      feed("atom", "xml"),
      `${preamble}<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}"><title>${xml(title)}</title><id>${xml(origin + feed("atom", "xml"))}</id><updated>${new Date(latest(posts)).toISOString()}</updated><author><name>Ikuma Yamashita</name></author><link rel="alternate" href="${xml(blog)}"/><link rel="self" href="${xml(origin + feed("atom", "xml"))}"/>${entries.join("")}</feed>`,
    );
    await save(
      feed("json-feed", "json"),
      JSON.stringify({
        version: "https://jsonfeed.org/version/1",
        title,
        home_page_url: blog,
        feed_url: origin + feed("json-feed", "json"),
        description,
        items: posts.map((post) => {
          const url = articleUrl(origin, locale, post.slug);
          return {
            id: url,
            url,
            title: post.title,
            content_text: post.description,
          };
        }),
      }),
    );
  }
  const urls = blogLocales.flatMap((locale) =>
    lists[locale].map((post) => {
      const localUrl = articleUrl(origin, locale, post.slug);
      const alternates = blogLocales.filter((candidate) =>
        lists[candidate].some(({ slug }) => slug === post.slug),
      );
      const links = alternates.map(
        (candidate) =>
          `<xhtml:link rel="alternate" hreflang="${candidate}" href="${xml(articleUrl(origin, candidate, post.slug))}"/>`,
      );
      if (alternates.includes("en"))
        links.push(
          `<xhtml:link rel="alternate" hreflang="x-default" href="${xml(articleUrl(origin, "en", post.slug))}"/>`,
        );
      return `<url><loc>${xml(localUrl)}</loc>${links.join("")}</url>`;
    }),
  );
  await save(
    `${blogCache}/sitemap.xml`,
    `${preamble}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>`,
  );
}
