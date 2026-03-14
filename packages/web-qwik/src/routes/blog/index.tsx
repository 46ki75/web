import { component$ } from "@builder.io/qwik";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { BlogIndex } from "~/components/blog/blog-index";
import { generateHead } from "~/utils/common";

const language = "en";

export default component$(() => {
  return <BlogIndex language={language} />;
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  const headBase = generateHead({
    url,
    title: "Blog",
    ogType: "website",
    description:
      "Personal blog by Ikuma Yamashita on software engineering, web development, and projects.",
    language,
  });

  return headBase;
};
