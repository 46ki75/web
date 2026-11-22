import { query } from "@solidjs/router";

import type {
  BlogArticleSnapshot,
  BlogSnapshotEntry,
  BlogTagSnapshot,
} from "./blog-snapshot";
import type { Locale } from "~/i18n/locale";
import { readContent, requireContent } from "./content";
import {
  articlePath,
  isArticleSlug,
  listPath,
  tagsPath,
} from "./content-paths";

export const getBlogData = query(async (locale: Locale) => {
  const [blogMeta, tags] = await Promise.all([
    requireContent<BlogSnapshotEntry[]>(listPath(locale)),
    requireContent<BlogTagSnapshot[]>(tagsPath),
  ]);
  return { blogMeta, tags };
}, "blog-data");

type SnapshotArticle = BlogArticleSnapshot & { availableLocales: Locale[] };

export const getBlogArticle = query(
  async (slug: string, locale: Locale) => ({
    contents: isArticleSlug(slug)
      ? await readContent<SnapshotArticle>(articlePath(slug, locale))
      : undefined,
  }),
  "blog-article",
);
