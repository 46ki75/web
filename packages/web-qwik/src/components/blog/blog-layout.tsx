import { component$, Slot, useContext, useTask$ } from "@builder.io/qwik";

import styles from "./blog-layout.module.scss";

import { BlogSide } from "~/components/blog/blog-side";
import { BlogMain } from "~/components/blog/blog-main";
import { client } from "../../../openapi/client";
import { BlogContext } from "~/context/blog";
import type { Language } from "~/types";

export interface BlogLayoutProps {
  language: Language;
}

export const BlogLayout = component$<BlogLayoutProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  useTask$(async () => {
    if (blogState.blogMeta[language].length === 0) {
      const { data: blogMeta } = await client.GET("/api/v2/blog", {
        params: {
          header: { "accept-language": language },
        },
      });

      if (blogMeta != null) {
        blogState.blogMeta[language] = blogMeta.sort((a, b) =>
          b.created_at.localeCompare(a.created_at),
        );
      }
    }

    if (blogState.tags.length === 0) {
      const { data: blogTags } = await client.GET("/api/v2/blog/tag", {});

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
