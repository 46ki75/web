import { ElmA2ui, notionBlockCatalog } from "@elmethis/solid";
import { useNavigate } from "@solidjs/router";
import { createMemo, For } from "solid-js";

import type { BlogContentsResponse } from "../../../openapi/blog";
import { ogImageUrl } from "../../../openapi/blog";
import { Meta } from "../common/meta";
import { Tag } from "../common/tag";
import { useBlog } from "~/context/blog";
import { useI18n } from "~/i18n/context";

import styles from "./blog-article.module.css";

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
      createSurface: { surfaceId, catalogId: NOTION_BLOCK_CATALOG_ID },
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

export interface BlogArticleProps {
  slug: string;
  contents: BlogContentsResponse;
}

export function BlogArticle(props: BlogArticleProps) {
  const blogState = useBlog();
  const { t, locale, localizePath } = useI18n();
  const navigate = useNavigate();
  const tags = createMemo(() =>
    props.contents.meta.tag_ids.flatMap((id) => {
      const tag = blogState.tags.find((candidate) => candidate.id === id);
      return tag ? [tag] : [];
    }),
  );
  const messages = createMemo(() =>
    surfaceToMessages(props.contents.surface, `blog-${locale()}-${props.slug}`),
  );

  const handleTagClick = (tagId: string) => {
    blogState.setSelectedTagIds([tagId]);
    navigate(localizePath("/blog/search"));
  };

  return (
    <article>
      <div
        class={styles["blog-article"]}
        style={{
          "view-transition-name": `blog-article-resolved-${locale()}-${props.slug}`,
        }}
      >
        <Meta
          title={props.contents.meta.title}
          createdAt={props.contents.meta.created_at}
          updatedAt={props.contents.meta.updated_at}
          image={ogImageUrl(props.slug, locale())}
          links={[
            {
              text: t("common.home"),
              onClick: () => navigate(localizePath("/")),
            },
            {
              text: t("common.blog"),
              onClick: () => navigate(localizePath("/blog")),
            },
            {
              text: "Article",
              onClick: () =>
                navigate(localizePath(`/blog/article/${props.slug}`)),
            },
          ]}
        >
          <div class={styles["tag-container"]}>
            <For each={tags()}>
              {(tag) => (
                <span class={styles.tag} onClick={() => handleTagClick(tag.id)}>
                  <Tag
                    name={locale() === "en" ? tag.name_en : tag.name_ja}
                    src={tag.icon_url ?? ""}
                  />
                </span>
              )}
            </For>
          </div>
        </Meta>
        <ElmA2ui catalog={notionBlockCatalog} messages={messages()} />
      </div>
    </article>
  );
}
