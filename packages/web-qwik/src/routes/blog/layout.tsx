import { component$, Slot } from "@builder.io/qwik";

import { BlogLayout } from "~/components/blog/blog-layout";

export default component$(() => {
  return (
    <BlogLayout>
      <Slot />
    </BlogLayout>
  );
});
