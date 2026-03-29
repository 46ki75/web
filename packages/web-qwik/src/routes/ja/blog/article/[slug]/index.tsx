import { component$ } from "@builder.io/qwik";

import { DocumentHead, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { BlogArticle } from "~/components/blog/blog-article";
import { generateBlogMeta } from "~/utils/blog/seo";
import { client } from "../../../../../../openapi/client";

const LANGUAGE = "ja";

export const useBlogMeta = routeLoader$(async ({ params, url, error }) => {
  const { data: blogMeta } = await client.GET("/api/v2/blog/{slug}", {
    params: {
      header: { "accept-language": LANGUAGE },
      path: { slug: params.slug },
    },
  });

  if (!blogMeta) {
    console.error(`Blog post with slug "${params.slug}" not found`);
    throw error(404, "Blog post not found");
  }

  return { meta: blogMeta!.meta, url: url.toString() };
});

export const head: DocumentHead = ({ resolveValue }) => {
  const blogMeta = resolveValue(useBlogMeta);

  return generateBlogMeta({
    url: blogMeta!.url,
    blogMeta: blogMeta!.meta,
    language: LANGUAGE,
  });
};

export default component$(() => {
  const loc = useLocation();

  return (
    <>
      <BlogArticle slug={loc.params.slug} language="ja" />
    </>
  );
});
