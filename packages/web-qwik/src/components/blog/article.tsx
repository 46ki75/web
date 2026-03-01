import {
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { Component } from "jarkup-ts";

import styles from "./article.scoped.scss?inline";
import { ElmJarkup } from "@elmethis/qwik";

import { paths } from "../../../openapi/schema";
import { client } from "../../../openapi/client";

export interface ArticleProps {
  slug: string;
}

export const Article = component$<ArticleProps>(({ slug }) => {
  useStylesScoped$(styles);

  const jarkup = useResource$(async () => {
    const { data: blogContents } = await client.GET("/api/v2/blog/{slug}", {
      baseUrl: "https://dev-www.ikuma.cloud",
      params: {
        path: { slug: slug! },
        header: { "accept-language": "en" },
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
        onResolved={(data) => <ElmJarkup jsonComponents={data.components} />}
        // onRejected={(err) => <p>Error: {err.message}</p>}
      />
    </article>
  );
});
