import type { ParentProps } from "solid-js";

import { BlogProvider, type BlogProviderProps } from "~/context/blog";
import { BlogMain } from "./blog-main";
import { BlogSide } from "./blog-side";

import styles from "./blog-layout.module.css";

export type BlogLayoutProps = ParentProps<BlogProviderProps>;

export function BlogLayout(props: BlogLayoutProps) {
  return (
    <BlogProvider blogMeta={props.blogMeta} tags={props.tags}>
      <div class={styles["blog-layout"]}>
        <BlogMain>{props.children}</BlogMain>
        <BlogSide />
      </div>
    </BlogProvider>
  );
}
