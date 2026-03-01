import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./blog-main.scoped.scss?inline";

export type BlogMainProps = object;

export const BlogMain = component$<BlogMainProps>(() => {
  useStylesScoped$(styles);
  return (
    <main class="blog-main">
      <Slot />
    </main>
  );
});
