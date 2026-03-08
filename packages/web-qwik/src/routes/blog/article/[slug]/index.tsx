import { component$, isServer } from "@builder.io/qwik";

import { DocumentHead, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { BlogArticle } from "~/components/blog/blog-article";
import { client } from "../../../../../openapi/client";

export const useBlogMeta = routeLoader$(async ({ params, pathname }) => {
  const { slug } = params;
  const language = pathname.split("/")[1] === "ja" ? "ja" : "en";

  const { data: blogMeta } = await client.GET("/api/v2/blog/{slug}", {
    params: {
      header: { "accept-language": language },
      path: { slug },
    },
  });

  return blogMeta && { language, meta: blogMeta.meta };
});

export const head: DocumentHead = ({ resolveValue }) => {
  const origin = () => {
    if (isServer) {
      const stageName = process.env.STAGE_NAME;
      const DOMAIN =
        stageName === "prod"
          ? "https://www-ikuma.cloud"
          : `https://${stageName}-www.ikuma.cloud`;
      return DOMAIN;
    } else {
      return location.origin;
    }
  };

  const blogMeta = resolveValue(useBlogMeta);

  return {
    title: blogMeta ? blogMeta.meta.title : "Blog Article",
    meta: [
      {
        name: "description",
        content: blogMeta ? blogMeta.meta.description : "Blog Article",
      },
      {
        property: "og:title",
        content: blogMeta ? blogMeta.meta.title : "Blog Article",
      },
      {
        property: "og:description",
        content: blogMeta ? blogMeta.meta.description : "Blog Article",
      },
      {
        property: "og:image",
        content: blogMeta
          ? `${origin()}/api/v2/blog/${blogMeta.meta.slug}/og-image?lang=${blogMeta.language}`
          : "",
      },
    ],
  };
};

export default component$(() => {
  const loc = useLocation();

  return (
    <>
      <BlogArticle slug={loc.params.slug} language="en" />
    </>
  );
});
