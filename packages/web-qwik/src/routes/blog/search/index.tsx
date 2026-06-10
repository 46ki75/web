import { component$ } from "@qwik.dev/core";
import { DocumentHead } from "@qwik.dev/router";
import { BlogSearch } from "~/components/blog/blog-search";
import { generateHead } from "~/utils/common";

const language = "en";

export default component$(() => {
  return <BlogSearch language={language} />;
});

export const head: DocumentHead = ({ url }) => {
  const headBase = generateHead({
    url: url.toString(),
    title: "Blog Search",
    ogType: "website",
    description:
      "Personal blog by Ikuma Yamashita on software engineering, web development, and projects.",
    language,
  });

  return headBase;
};
