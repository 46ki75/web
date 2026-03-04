import { component$ } from "@builder.io/qwik";
import { BlogSearch } from "~/components/blog/blog-search";

export default component$(() => {
  return <BlogSearch language="ja" />;
});
