import { ElmInlineText } from "@elmethis/solid";
import { A, useNavigate } from "@solidjs/router";
import { For, type JSX } from "solid-js";

import type { BlogResponse, BlogTagResponse } from "../../../openapi/blog";
import { ogImageUrl } from "../../../openapi/blog";
import { DateComponent } from "../common/date";
import { Tag } from "../common/tag";
import { useBlog } from "~/context/blog";
import { useI18n } from "~/i18n/context";

import styles from "./blog-card.module.css";

export interface BlogCardProps {
  style?: JSX.CSSProperties;
  blog: BlogResponse;
  tags: BlogTagResponse[];
  delay?: number;
}

export function BlogCard(props: BlogCardProps) {
  const blogState = useBlog();
  const { locale, localizePath } = useI18n();
  const navigate = useNavigate();

  const handleTagClick = (tagId: string) => {
    blogState.setSelectedTagIds([tagId]);
    navigate(localizePath("/blog/search"));
  };

  return (
    <div
      class={styles["blog-card"]}
      classList={{ [styles["animation-enabled"]]: (props.delay ?? 0) > 0 }}
      style={{
        "--delay": `${props.delay ?? 0}ms`,
        ...props.style,
      }}
    >
      <A
        href={localizePath(`/blog/article/${props.blog.slug}`)}
        style={{ all: "unset" }}
      >
        <div class={styles["blog-card-link"]}>
          <img
            class={styles["blog-card-image"]}
            src={ogImageUrl(props.blog.slug, locale())}
            alt={props.blog.title}
            width={1140}
            height={600}
          />
          <div class={styles["blog-card-content"]}>
            <span class={styles["blog-card-content-title"]}>
              <ElmInlineText bold>{props.blog.title}</ElmInlineText>
            </span>
            <div class={styles["blog-card-content-description"]}>
              <ElmInlineText size="0.75rem">
                {props.blog.description}
              </ElmInlineText>
            </div>
            <DateComponent
              createdAt={props.blog.created_at}
              updatedAt={props.blog.updated_at}
            />
          </div>
        </div>
      </A>
      <div class={styles["blog-card-tag-container"]}>
        <For each={props.tags}>
          {(tag) => (
            <span class={styles.tag} onClick={() => handleTagClick(tag.id)}>
              <Tag
                name={locale() === "ja" ? tag.name_ja : tag.name_en}
                src={tag.icon_url ?? ""}
              />
            </span>
          )}
        </For>
      </div>
    </div>
  );
}
