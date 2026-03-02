import {
  $,
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { Component } from "jarkup-ts";

import styles from "./blog-article.scoped.scss?inline";
import { ElmBlockFallback, ElmJarkup } from "@elmethis/qwik";

import { paths } from "../../../openapi/schema";
import { client } from "../../../openapi/client";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";

export interface ArticleProps {
  slug: string;
  lang: string;
}

export const BlogArticle = component$<ArticleProps>(({ slug, lang }) => {
  useStylesScoped$(styles);

  const jarkup = useResource$(async ({ track }) => {
    const trackedSlug = track(() => slug);
    const trackedLang = track(() => lang);

    const { data: blogContents } = await client.GET("/api/v2/blog/{slug}", {
      params: {
        path: { slug: trackedSlug! },
        header: { "accept-language": trackedLang },
      },
    });

    return blogContents as {
      meta: paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
      components: Component[];
    };
  });

  const nav = useNavigate();

  return (
    <>
      <Resource
        value={jarkup}
        onPending={() => <ElmBlockFallback />}
        onResolved={(data) => (
          <article>
            <Meta
              title={data.meta.title}
              createdAt={data.meta.created_at}
              updatedAt={data.meta.updated_at}
              image={`/api/v2/blog/${slug}/og-image?lang=${lang}`}
              links={[
                {
                  text: "Home",
                  onClick$: $(() => nav(lang === "en" ? "/" : `/${lang}`)),
                },
                {
                  text: "Blog",
                  onClick$: $(() =>
                    nav(lang === "en" ? "/blog" : `/${lang}/blog`),
                  ),
                },
                {
                  text: "Article",
                  onClick$: $(() =>
                    nav(
                      lang === "en"
                        ? `/blog/article/${slug}`
                        : `/${lang}/blog/article/${slug}`,
                    ),
                  ),
                },
              ]}
            />
            <ElmJarkup jsonComponents={data.components} />
          </article>
        )}
        // TODO: Handle errors properly
        // onRejected={(err) => <p>Error: {err.message}</p>}
      />
    </>
  );
});
