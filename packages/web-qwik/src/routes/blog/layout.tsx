import { component$, Slot } from "@qwik.dev/core";

import { BlogLayout } from "~/components/blog/blog-layout";

export default component$(() => {
  return (
    <BlogLayout language="en">
      <Slot />
    </BlogLayout>
  );
});
