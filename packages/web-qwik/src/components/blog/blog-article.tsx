import {
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { Component } from "jarkup-ts";

import styles from "./blog-article.scoped.scss?inline";
import { ElmHeading, ElmJarkup } from "@elmethis/qwik";

import { paths } from "../../../openapi/schema";
import { client } from "../../../openapi/client";

export interface ArticleProps {
  slug: string;
  lang: string;
}

export const BlogArticle = component$<ArticleProps>(({ slug, lang }) => {
  useStylesScoped$(styles);

  const jarkup = useResource$(async () => {
    const { data: blogContents } = await client.GET("/api/v2/blog/{slug}", {
      params: {
        path: { slug: slug! },
        header: { "accept-language": lang },
      },
    });

    return blogContents as {
      meta: paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
      components: Component[];
    };
  });

  return (
    <article>
      <Resource
        value={jarkup}
        onPending={() => <p>Loading...</p>}
        onResolved={(data) => (
          <>
            <ElmHeading level={1}>{data.meta.title}</ElmHeading>
            <ElmJarkup jsonComponents={data.components} />
          </>
        )}
        // onRejected={(err) => <p>Error: {err.message}</p>}
      />
    </article>
  );
});
