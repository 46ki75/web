import { $, component$, useContext } from "@builder.io/qwik";

import styles from "./blog-card.module.scss";

import { paths } from "../../../openapi/schema";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { Language } from "~/types";
import { ElmInlineText } from "@elmethis/qwik";
import { Tag } from "../common/tag";
import { DateComponent } from "../common/date";
import { BlogContext } from "~/context/blog";

export interface BlogCardProps {
  blog: paths["/api/v2/blog/{slug}"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];
  tags: paths["/api/v2/blog/tag"]["get"]["responses"]["200"]["content"]["application/json"];
  language: Language;
  delay?: number;
}

export const BlogCard = component$<BlogCardProps>(
  ({ blog, tags, language, delay = 0 }) => {
    const blogState = useContext(BlogContext);

    const nav = useNavigate();

    const handleTagClick = $(async (tagId: string) => {
      blogState.selectedTagIds = [tagId];
      await nav(
        language === "en" ? "/blog/search" : `/${language}/blog/search`,
      );
    });

    return (
      <div
        key={blog.page_id}
        class={styles["blog-card"]}
        style={{
          "--delay": `${delay}ms`,
        }}
      >
        <Link
          key={blog.page_id}
          href={
            language === "en"
              ? `/blog/article/${blog.slug}`
              : `/${language}/blog/article/${blog.slug}`
          }
          style={{ all: "unset" }}
        >
          <div class={styles["blog-card-link"]}>
            <img
              class={styles["blog-card-image"]}
              src={`/api/v2/blog/${blog.slug}/og-image?lang=${language}`}
              alt={blog.title}
              width={1140}
              height={600}
            />

            <div class={styles["blog-card-content"]}>
              <span class={styles["blog-card-content-title"]}>
                <ElmInlineText bold>{blog.title}</ElmInlineText>
              </span>

              <div class={styles["blog-card-content-description"]}>
                <ElmInlineText size="0.75rem">{blog.description}</ElmInlineText>
              </div>

              <DateComponent
                createdAt={blog.created_at}
                updatedAt={blog.updated_at}
              />
            </div>
          </div>
        </Link>

        <div class={styles["blog-card-tag-container"]}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              class={styles.tag}
              onClick$={() => handleTagClick(tag.id!)}
            >
              <Tag
                name={language === "ja" ? tag.name_ja : tag.name_en}
                src={tag.icon_url!}
              />
            </span>
          ))}
        </div>
      </div>
    );
  },
);
