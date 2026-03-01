import { component$ } from "@builder.io/qwik";

import { useLocation } from "@builder.io/qwik-city";
import { Article } from "~/components/blog/article";

export default component$(() => {
  const loc = useLocation();

  return (
    <>
      <Article slug={loc.params.slug} />
    </>
  );
});
