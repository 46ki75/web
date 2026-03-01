import { component$, Slot, useStylesScoped$ } from "@builder.io/qwik";

import styles from "../../blog/blog-layout.scoped.scss?inline";
import { BlogSide } from "~/components/blog/blog-side";
import { BlogMain } from "~/components/blog/blog-main";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="blog-layout">
      <BlogMain>
        <Slot />
      </BlogMain>

      <BlogSide />
    </div>
  );
});
