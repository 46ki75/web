import { component$, Slot } from "@builder.io/qwik";

import styles from "./blog-main.module.scss";

export type BlogMainProps = object;

export const BlogMain = component$<BlogMainProps>(() => {
  return (
    <main class={styles["blog-main"]}>
      <Slot />
    </main>
  );
});
