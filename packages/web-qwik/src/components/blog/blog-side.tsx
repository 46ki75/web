import { component$, useContext } from "@builder.io/qwik";

import styles from "./blog-side.module.scss";

import { ElmInlineText } from "@elmethis/qwik";
import { Link } from "@builder.io/qwik-city";
import { Date } from "../common/date";
import { BlogContext } from "~/context/blog";
import { Tag } from "../common/tag";

export type BlogSideProps = {
  language: string;
};

export const BlogSide = component$<BlogSideProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  return (
    <nav class={styles["blog-side"]}>
      <Link
        href={language === "en" ? "/blog/search" : `/${language}/blog/search`}
      >
        SEARCH (TODO)
      </Link>

      {blogState.blogMeta?.map((blog, index) => (
        <div
          key={blog.page_id}
          class={styles["side-card"]}
          style={{
            "--delay": `${(index + 1) * 100}ms`,
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
            <div class={styles["side-card-link"]}>
              <img
                class={styles["side-card-image"]}
                src={`/api/v2/blog/${blog.slug}/og-image?lang=${language}`}
                alt={blog.title}
                width={1140}
                height={600}
              />

              <div class={styles["side-card-content"]}>
                <ElmInlineText bold>{blog.title}</ElmInlineText>

                <div class={styles["side-card-content-description"]}>
                  <ElmInlineText size="0.8rem">
                    {blog.description}
                  </ElmInlineText>
                </div>

                <Date createdAt={blog.created_at} updatedAt={blog.updated_at} />
              </div>
            </div>
          </Link>

          <div class={styles["side-card-tag-container"]}>
            {blogState.tags
              ?.filter((tag) => blog.tag_ids?.includes(tag.id))
              .map((tag) => (
                <Tag
                  key={tag.id}
                  name={language === "ja" ? tag.name_ja : tag.name_en}
                  src={tag.icon_url!}
                />
              ))}
          </div>
        </div>
      ))}
    </nav>
  );
});
