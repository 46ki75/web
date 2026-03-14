import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Privacy } from "~/components/main/privacy";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Privacy language="ja" />;
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  const headBase = generateHead({
    url,
    title: "プライバシーポリシー",
    ogType: "profile",
    description: "ポートフォリオとブログ",
    language: "ja",
  });

  return headBase;
};
