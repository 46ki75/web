import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./blog-side.scoped.scss?inline";

export type BlogSideProps = object;

export const BlogSide = component$<BlogSideProps>(() => {
  useStylesScoped$(styles);
  return <nav class="blog-side">SIDE (TODO)</nav>;
});
