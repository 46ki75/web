import { component$, Slot } from "@builder.io/qwik";

import styles from "./blog-main.module.scss";
import { BlogAuthor } from "./blog-author";
import type { Language } from "~/types";

export type BlogMainProps = {
  language: Language;
};

export const BlogMain = component$<BlogMainProps>(({ language }) => {
  return (
    <main class={styles["blog-main"]}>
      <Slot />

      <BlogAuthor language={language} />
    </main>
  );
});
