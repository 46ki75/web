import { component$ } from "@builder.io/qwik";

import { useLocation } from "@builder.io/qwik-city";
import { BlogArticle } from "~/components/blog/blog-article";

export default component$(() => {
  const loc = useLocation();

  return (
    <>
      <BlogArticle slug={loc.params.slug} lang={loc.params.lang} />
    </>
  );
});
