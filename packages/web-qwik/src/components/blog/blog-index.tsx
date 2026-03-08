import { $, component$, useContext } from "@builder.io/qwik";

import styles from "./blog-index.module.scss";
import { BlogContext } from "~/context/blog";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";

export interface BlogIndexProps {
  language: Language;
}

export const BlogIndex = component$<BlogIndexProps>(({ language }) => {
  const nav = useNavigate();
  const blogState = useContext(BlogContext);

  return (
    <div class={styles["blog-index"]}>
      <Meta
        title="Blog"
        createdAt="2023-10-01"
        updatedAt="2023-10-01"
        links={[
          {
            text: "Home",
            onClick$: $(() => nav(language === "en" ? "/" : `/${language}`)),
          },
          {
            text: "Blog",
            onClick$: $(() =>
              nav(language === "en" ? "/blog" : `/${language}/blog`),
            ),
          },
        ]}
      />

      <div class={styles["blog-card-list"]}>
        {blogState.blogMeta[language].map((blog, index) => (
          <BlogCard
            key={blog.page_id}
            blog={blog}
            tags={blogState.tags?.filter((tag) =>
              blog.tag_ids?.includes(tag.id),
            )}
            language={language}
            delay={(index + 1) * 100}
          ></BlogCard>
        ))}
      </div>
    </div>
  );
});
