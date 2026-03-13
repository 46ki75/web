import type { BlogMeta, Language } from "~/types";
import { generateHead, origin } from "../common";

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
    ogImage: `${origin()}/api/v2/blog/${blogMeta.slug}/og-image?lang=${language}`,
    language,
  });
};
