import { component$, Slot, useContext, useTask$ } from "@qwik.dev/core";

import styles from "./blog-layout.module.css";

import { BlogSide } from "~/components/blog/blog-side";
import { BlogMain } from "~/components/blog/blog-main";
import { getBlogList, getBlogTags } from "../../../openapi/blog";
import { BlogContext } from "~/context/blog";
import type { Language } from "~/types";

export interface BlogLayoutProps {
  language: Language;
}

export const BlogLayout = component$<BlogLayoutProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  useTask$(async () => {
    if (blogState.blogMeta[language].length === 0) {
      const blogMeta = await getBlogList(language);

      if (blogMeta != null) {
        blogState.blogMeta[language] = blogMeta.sort((a, b) =>
          b.created_at.localeCompare(a.created_at),
        );
      }
    }

    if (blogState.tags.length === 0) {
      const blogTags = await getBlogTags();

      if (blogTags != null) {
        blogState.tags = blogTags;
      }
    }
  });

  return (
    <div class={styles["blog-layout"]}>
      <BlogMain language={language}>
        <Slot />
      </BlogMain>

      <BlogSide language={language} />
    </div>
  );
});
