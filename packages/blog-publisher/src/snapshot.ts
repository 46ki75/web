import {
  blogCache,
  blogLocales,
  type BlogArticleSnapshot,
  type BlogLocale,
  type BlogSnapshotEntry,
} from "@web/blog-snapshot";
import { saveFeeds } from "./feeds.ts";
import { imageDownloader, snapshotImages, type Save } from "./media.ts";
import { SnapshotError, type notionSource } from "./notion.ts";

export async function generateSnapshot({
  source,
  save,
  siteOrigin,
  download,
}: {
  source: ReturnType<typeof notionSource>;
  save: Save;
  siteOrigin: string;
  download: ReturnType<typeof imageDownloader>;
}) {
  const origin = URL.parse(siteOrigin);
  if (
    !origin ||
    origin.protocol !== "https:" ||
    origin.username ||
    origin.password ||
    origin.href !== `${origin.origin}/`
  ) {
    throw new SnapshotError("--site-origin must be a bare HTTPS origin");
  }
  const lists: Record<BlogLocale, BlogSnapshotEntry[]> = { en: [], ja: [] };
  const images = snapshotImages(save, download);
  const articles = await source.articles();
  if (articles.length === 0) {
    throw new SnapshotError(
      "Notion returned no published articles; refusing to produce an empty snapshot",
    );
  }
  const tags = await source.tags();
  const tagIds = new Set(tags.map(({ id }) => id));
  for (const { meta } of articles) {
    if (meta.tag_ids.some((id) => !tagIds.has(id)))
      throw new SnapshotError(
        `Published article ${meta.page_id} references a tag not returned by Notion`,
      );
  }
  for (const { contentPageId, meta, locale, cover } of articles) {
    const prefix = `${blogCache}/article/${meta.slug}`;
    const surface = await source.surface(contentPageId);
    await images.surface(surface);
    await images.cover(`${prefix}/og-image/${locale}`, cover);
    await save(
      `${prefix}/contents/${locale}.json`,
      JSON.stringify({ meta, surface } satisfies BlogArticleSnapshot),
    );
    lists[locale].push(meta);
  }
  for (const tag of tags) {
    if (tag.icon_url) tag.icon_url = await images.icon(tag.icon_url);
  }
  await save(`${blogCache}/tags.json`, JSON.stringify(tags));
  for (const locale of blogLocales)
    await save(
      `${blogCache}/list/${locale}.json`,
      JSON.stringify(lists[locale]),
    );
  await saveFeeds(save, origin.origin, lists);
  return { en: lists.en.length, ja: lists.ja.length, tags: tags.length };
}
