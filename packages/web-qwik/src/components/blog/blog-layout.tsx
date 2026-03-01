import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./blog-layout.scoped.scss?inline";

import { BlogSide } from "~/components/blog/blog-side";
import { BlogMain } from "~/components/blog/blog-main";

export interface BlogLayoutProps {
  language: string;
}

export const BlogLayout = component$<BlogLayoutProps>(({ language }) => {
  useStylesScoped$(styles);

  return (
    <div class="blog-layout">
      <BlogMain>
        <Slot />
      </BlogMain>

      <BlogSide language={language} />
    </div>
  );
});
