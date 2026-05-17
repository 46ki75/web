import { component$ } from "@qwik.dev/core";
import { routeLoader$, type DocumentHead } from "@qwik.dev/router";
import { Home } from "~/components/main/home";
import { siteConfig } from "~/meta/site-config";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Home language="ja" />;
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  const headBase = generateHead({
    url,
    title: "Ikuma Yamashita",
    ogType: "profile",
    description: siteConfig.ja.description,
    language: "ja",
  });

  return headBase;
};
