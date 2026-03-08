import { component$ } from "@builder.io/qwik";
import { BlogIndex } from "~/components/blog/blog-index";

export default component$(() => {
  return <BlogIndex language="en" />;
});
