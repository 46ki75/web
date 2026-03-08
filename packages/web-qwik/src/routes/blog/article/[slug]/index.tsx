import { component$, isServer } from "@builder.io/qwik";

import { DocumentHead, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { BlogArticle } from "~/components/blog/blog-article";
import { client } from "../../../../../openapi/client";

const LANGUAGE = "en";

export const useBlogMeta = routeLoader$(async ({ params }) => {
  const { data: blogMeta } = await client.GET("/api/v2/blog/{slug}", {
    params: {
      header: { "accept-language": LANGUAGE },
      path: { slug: params.slug },
    },
  });

  return blogMeta?.meta;
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
          ? `${origin()}/api/v2/blog/${blogMeta.slug}/og-image?lang=${LANGUAGE}`
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
