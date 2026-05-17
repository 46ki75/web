import { component$ } from "@qwik.dev/core";
import { DocumentHead } from "@qwik.dev/router";
import { routeLoader$ } from "@qwik.dev/router";
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
