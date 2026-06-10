import { component$ } from "@qwik.dev/core";
import { DocumentHead } from "@qwik.dev/router";
import { BlogIndex } from "~/components/blog/blog-index";
import { generateHead } from "~/utils/common";

const language = "en";

export default component$(() => {
  return <BlogIndex language={language} />;
});

export const head: DocumentHead = ({ url }) => {
  const headBase = generateHead({
    url: url.toString(),
    title: "Blog",
    ogType: "website",
    description:
      "Personal blog by Ikuma Yamashita on software engineering, web development, and projects.",
    language,
  });

  return headBase;
};
