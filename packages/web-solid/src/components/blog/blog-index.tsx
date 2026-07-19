import { ElmHeading, ElmParagraph } from "@elmethis/solid";
import { useNavigate } from "@solidjs/router";
import { createMemo, For } from "solid-js";

import { Meta } from "../common/meta";
import { useBlog } from "~/context/blog";
import { useI18n } from "~/i18n/context";
import { BlogCard } from "./blog-card";

import styles from "./blog-index.module.css";

export function BlogIndex() {
  const blogState = useBlog();
  const { t, localizePath } = useI18n();
  const navigate = useNavigate();
  const featured = createMemo(() =>
    blogState.blogMeta.filter((blog) => blog.featured),
  );

  const tagsFor = (tagIds: string[]) =>
    blogState.tags.filter((tag) => tagIds.includes(tag.id));

  return (
    <div class={styles["blog-index"]}>
      <Meta
        title="Blog"
        createdAt="2023-10-01"
        updatedAt="2023-10-01"
        links={[
          {
            text: t("common.home"),
            onClick: () => navigate(localizePath("/")),
          },
          {
            text: t("common.blog"),
            onClick: () => navigate(localizePath("/blog")),
          },
        ]}
      />
      <div class={styles["blog-index-content"]}>
        <ElmParagraph>{t("blog.description")}</ElmParagraph>
        <ElmHeading level={2} text={t("common.featured")} />
        <div class={styles["blog-card-list"]}>
          <For each={featured()}>
            {(blog, index) => (
              <BlogCard
                blog={blog}
                tags={tagsFor(blog.tag_ids)}
                delay={(index() + 1) * 100}
              />
            )}
          </For>
        </div>
        <ElmHeading level={2} text={t("common.recent")} />
        <div class={styles["blog-card-list"]}>
          <For each={blogState.blogMeta.slice(0, 3)}>
            {(blog, index) => (
              <BlogCard
                blog={blog}
                tags={tagsFor(blog.tag_ids)}
                delay={(index() + 1) * 100}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
