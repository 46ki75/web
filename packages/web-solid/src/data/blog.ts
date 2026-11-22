import { query } from "@solidjs/router";

import type {
  BlogContentsResponse,
  BlogResponse,
  BlogTagResponse,
} from "../../openapi/blog";
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
    requireContent<BlogResponse[]>(listPath(locale)),
    requireContent<BlogTagResponse[]>(tagsPath),
  ]);
  return { blogMeta, tags };
}, "blog-data");

type SnapshotArticle = BlogContentsResponse & { availableLocales: Locale[] };

export const getBlogArticle = query(
  async (slug: string, locale: Locale) => ({
    contents: isArticleSlug(slug)
      ? await readContent<SnapshotArticle>(articlePath(slug, locale))
      : undefined,
  }),
  "blog-article",
);
