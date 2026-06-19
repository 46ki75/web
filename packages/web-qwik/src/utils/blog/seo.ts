import type { BlogMeta, Language } from "~/types";
import { generateHead, origin } from "../common";
import { ogImageUrl } from "../../../openapi/blog";

export const generateBlogMeta = ({
  url,
  blogMeta,
  language,
}: {
  url: string;
  blogMeta: BlogMeta;
  language: Language;
}) => {
  return generateHead({
    url,
    title: blogMeta.title,
    description: blogMeta.description,
    ogType: "article",
    ogImage: `${origin()}${ogImageUrl(blogMeta.slug, language)}`,
    language,
  });
};
