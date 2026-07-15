import { $, component$, useAsync$, useContext } from "@qwik.dev/core";

import { ElmA2ui, ElmBlockFallback, notionBlockCatalog } from "@elmethis/qwik";

import type { BlogResponse } from "../../../openapi/blog";
import { getBlogContents, ogImageUrl } from "../../../openapi/blog";
import { Meta } from "../common/meta";
import { useNavigate } from "@qwik.dev/router";
import { BlogContext } from "~/context/blog";
import { Tag } from "../common/tag";

import styles from "./blog-article.module.css";
import { Language } from "~/types";

type BlogContents = {
  meta: BlogResponse;
  surface: unknown;
};

const NOTION_BLOCK_CATALOG_ID =
  "https://46ki75.github.io/elmethis/a2ui/v0_9/notion_block_catalog.json";

const surfaceToMessages = (raw: unknown, surfaceId: string): object[] => {
  if (!raw || typeof raw !== "object") return [];
  const surface = raw as {
    components?: Record<string, { id: string; component: string }>;
  };

  return [
    {
      version: "v0.9",
      createSurface: {
        surfaceId,
        catalogId: NOTION_BLOCK_CATALOG_ID,
      },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: Object.values(surface.components ?? {}),
      },
    },
  ];
};

export interface ArticleProps {
  slug: string;
  language: Language;
}

export const BlogArticle = component$<ArticleProps>(({ slug, language }) => {
  const blogState = useContext(BlogContext);

  const contents = useAsync$<BlogContents>(async ({ track, abortSignal }) => {
    const trackedSlug = track(() => slug);
    const trackedLang = track(() => language);

    const blogContents = await getBlogContents(
      trackedSlug!,
      trackedLang,
      abortSignal,
    );

    return blogContents as BlogContents;
  });

  const nav = useNavigate();

  const handleTagClick = $(async (tagId: string) => {
    blogState.selectedTagIds = [tagId];
    await nav(language === "en" ? "/blog/search" : `/${language}/blog/search`);
  });

  return (
    <article>
      {contents.loading ? (
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
            title={contents.value.meta.title}
            createdAt={contents.value.meta.created_at}
            updatedAt={contents.value.meta.updated_at}
            image={ogImageUrl(slug, language)}
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
              {contents.value.meta.tag_ids
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
          <ElmA2ui
            catalog={notionBlockCatalog}
            messages={surfaceToMessages(
              contents.value.surface,
              `blog-${language}-${slug}`,
            )}
          />
        </div>
      )}
    </article>
  );
});
