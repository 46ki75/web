import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { BlogSearch } from "~/components/blog/blog-search";

export default component$(() => {
  const loc = useLocation();

  return <BlogSearch language={loc.params.lang} />;
});
