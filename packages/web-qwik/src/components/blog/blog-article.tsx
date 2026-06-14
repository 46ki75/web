import { $, component$, useAsync$, useContext } from "@qwik.dev/core";
import type { Component } from "jarkup-ts";

import { ElmBlockFallback, ElmJarkup } from "@elmethis/qwik";

import { paths } from "../../../openapi/schema";
import { client } from "../../../openapi/client";
import { Meta } from "../common/meta";
import { useNavigate } from "@qwik.dev/router";
import { BlogContext } from "~/context/blog";
import { Tag } from "../common/tag";

import styles from "./blog-article.module.css";
import { Language } from "~/types";

type BlogContents = {
  meta: paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
  components: Component[];
};

export interface ArticleProps {
  slug: string;
  language: Language;
}

export const BlogArticle = component$<ArticleProps>(({ slug, language }) => {
  const blogState = useContext(BlogContext);

  const jarkup = useAsync$<BlogContents>(async ({ track, abortSignal }) => {
    const trackedSlug = track(() => slug);
    const trackedLang = track(() => language);

    const { data: blogContents } = await client.GET("/api/v2/blog/{slug}", {
      params: {
        path: { slug: trackedSlug! },
        header: { "accept-language": trackedLang },
      },
      signal: abortSignal,
    });

    return blogContents as BlogContents;
  });

  const nav = useNavigate();

  const handleTagClick = $(async (tagId: string) => {
    blogState.selectedTagIds = [tagId];
    await nav(language === "en" ? "/blog/search" : `/${language}/blog/search`);
  });

  return (
    <article>
      {jarkup.loading ? (
        <ElmBlockFallback
          height={"calc(100vh - 8rem)"}
          style={{
            viewTransitionName: `blog-article-pending-${language}-${slug}`,
          }}
        />
      ) : (
        <div
          class={styles["blog-article"]}
          style={{
            viewTransitionName: `blog-article-resolved-${language}-${slug}`,
          }}
        >
          <Meta
            title={jarkup.value.meta.title}
            createdAt={jarkup.value.meta.created_at}
            updatedAt={jarkup.value.meta.updated_at}
            image={`/api/v2/blog/${slug}/og-image?lang=${language}`}
            links={[
              {
                text: "Home",
                onClick$: $(() =>
                  nav(language === "en" ? "/" : `/${language}`),
                ),
              },
              {
                text: "Blog",
                onClick$: $(() =>
                  nav(language === "en" ? "/blog" : `/${language}/blog`),
                ),
              },
              {
                text: "Article",
                onClick$: $(() =>
                  nav(
                    language === "en"
                      ? `/blog/article/${slug}`
                      : `/${language}/blog/article/${slug}`,
                  ),
                ),
              },
            ]}
          >
            <div class={styles["tag-container"]}>
              {jarkup.value.meta.tag_ids
                .flatMap((id) => blogState.tags.find((t) => t.id === id))
                .map((tag) => (
                  <span
                    key={tag?.id}
                    class={styles.tag}
                    onClick$={() => handleTagClick(tag!.id!)}
                  >
                    <Tag
                      name={(language === "en" ? tag?.name_en : tag?.name_ja)!}
                      src={tag!.icon_url!}
                    ></Tag>
                  </span>
                ))}
            </div>
          </Meta>
          <ElmJarkup jsonComponents={jarkup.value.components} />
        </div>
      )}
    </article>
  );
});
