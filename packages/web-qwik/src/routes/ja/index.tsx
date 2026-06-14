import { component$ } from "@qwik.dev/core";
import { type DocumentHead } from "@qwik.dev/router";
import { Home } from "~/components/main/home";
import { siteConfig } from "~/meta/site-config";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Home language="ja" />;
});

export const head: DocumentHead = ({ url }) => {
  const headBase = generateHead({
    url: url.toString(),
    title: "Ikuma Yamashita",
    ogType: "profile",
    description: siteConfig.ja.description,
    language: "ja",
  });

  return headBase;
};
