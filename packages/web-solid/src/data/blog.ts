import { query } from "@solidjs/router";

import { getBlogContents, getBlogList, getBlogTags } from "../../openapi/blog";
import type { Locale } from "~/i18n/locale";

export const getBlogData = query(async (locale: Locale) => {
  "use server";

  const [blogMeta, tags] = await Promise.all([
    getBlogList(locale),
    getBlogTags(),
  ]);

  return {
    blogMeta: [...(blogMeta ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    ),
    tags: tags ?? [],
  };
}, "blog-data");

export const getBlogArticle = query(async (slug: string, locale: Locale) => {
  "use server";

  return getBlogContents(slug, locale);
}, "blog-article");
