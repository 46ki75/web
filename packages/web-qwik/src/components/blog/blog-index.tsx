import { component$, useContext } from "@builder.io/qwik";

import styles from "./blog-index.module.scss";
import { BlogContext } from "~/context/blog";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";

export interface BlogIndexProps {
  language: Language;
}

export const BlogIndex = component$<BlogIndexProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  return (
    <div class={styles["blog-index"]}>
      {blogState.blogMeta[language].map((blog, index) => (
        <BlogCard
          key={blog.page_id}
          blog={blog}
          tags={blogState.tags?.filter((tag) => blog.tag_ids?.includes(tag.id))}
          language={language}
          delay={(index + 1) * 100}
        ></BlogCard>
      ))}
    </div>
  );
});
