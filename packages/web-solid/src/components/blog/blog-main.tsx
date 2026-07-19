import { ElmBlockFallback } from "@elmethis/solid";
import { Suspense, type ParentProps } from "solid-js";

import styles from "./blog-main.module.css";
import { BlogAuthor } from "./blog-author";

export function BlogMain(props: ParentProps) {
  return (
    <main class={styles["blog-main"]}>
      <Suspense fallback={<ElmBlockFallback height="calc(100vh - 8rem)" />}>
        {props.children}
      </Suspense>
      <BlogAuthor />
    </main>
  );
}
