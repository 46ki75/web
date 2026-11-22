import { query } from "@solidjs/router";
import { GET } from "@solidjs/web/server-functions";

import { getBlogContents, getBlogList, getBlogTags } from "../../openapi/blog";
import type { Locale } from "~/i18n/locale";

// CloudFront's frontend behavior only allows GET, HEAD, and OPTIONS.
export const getBlogData = query(
  GET(async (locale: Locale) => {
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
  }),
  "blog-data",
);

export const getBlogArticle = query(
  GET(async (slug: string, locale: Locale) => {
    "use server";

    return { contents: await getBlogContents(slug, locale) };
  }),
  "blog-article",
);
