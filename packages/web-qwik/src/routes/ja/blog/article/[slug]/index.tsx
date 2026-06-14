import { component$ } from "@qwik.dev/core";

import { DocumentHead, routeLoader$, useLocation } from "@qwik.dev/router";
import { BlogArticle } from "~/components/blog/blog-article";
import { generateBlogMeta } from "~/utils/blog/seo";
import { client } from "../../../../../../openapi/client";

const LANGUAGE = "ja";

export const useBlogMeta = routeLoader$(async ({ params, error }) => {
  const { data: blogMeta } = await client.GET("/api/v2/blog/{slug}", {
    params: {
      header: { "accept-language": LANGUAGE },
      path: { slug: params.slug },
    },
  });

  if (!blogMeta) {
    console.info(`Blog post with slug "${params.slug}" not found`);
    throw error(404, "Blog post not found");
  }

  return { meta: blogMeta!.meta };
});

export const head: DocumentHead = ({ url, resolveValue }) => {
  const blogMeta = resolveValue(useBlogMeta);

  // During client-side navigation the head can re-resolve before the route
  // loader state is populated; render no head until the data arrives.
  if (!blogMeta) {
    return {};
  }

  return generateBlogMeta({
    url: url.toString(),
    blogMeta: blogMeta.meta,
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
