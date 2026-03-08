import type { BlogMeta, Language } from "~/types";
import { origin } from "../common";

export const generateBlogMeta = ({
  blogMeta,
  language,
}: {
  blogMeta: BlogMeta;
  language: Language;
}) => ({
  title: blogMeta ? blogMeta.title : "Blog Article",
  meta: [
    {
      name: "description",
      content: blogMeta ? blogMeta.description : "Blog Article",
    },
    {
      property: "og:title",
      content: blogMeta ? blogMeta.title : "Blog Article",
    },
    {
      property: "og:description",
      content: blogMeta ? blogMeta.description : "Blog Article",
    },
    {
      property: "og:image",
      content: blogMeta
        ? `${origin()}/api/v2/blog/${blogMeta.slug}/og-image?lang=${language}`
        : "",
    },
  ],
});
