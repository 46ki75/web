import { ElmButton, ElmMdiIcon } from "@elmethis/solid";
import { mdiBookSearch } from "@mdi/js";
import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";

import { useBlog } from "~/context/blog";
import { useI18n } from "~/i18n/context";
import { BlogCard } from "./blog-card";

import styles from "./blog-side.module.css";

export function BlogSide() {
  const blogState = useBlog();
  const { t, localizePath } = useI18n();
  const navigate = useNavigate();

  return (
    <nav class={styles["blog-side"]}>
      <ElmButton
        type="button"
        onClick={() => navigate(localizePath("/blog/search"))}
      >
        <ElmMdiIcon class={styles.icon} d={mdiBookSearch} />
        {t("common.searchBlogs")}
      </ElmButton>
      <For each={blogState.blogMeta}>
        {(blog, index) => (
          <BlogCard
            blog={blog}
            tags={blogState.tags.filter((tag) => blog.tag_ids.includes(tag.id))}
            delay={(index() + 1) * 100}
          />
        )}
      </For>
    </nav>
  );
}
