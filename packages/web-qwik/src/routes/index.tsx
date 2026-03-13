import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Home } from "~/components/main/home";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Home language="en" />;
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  const headBase = generateHead({
    url,
    title: "SrcJar",
    description: "Personal blog and portfolio",
    language: "en",
  });

  return headBase;
};
