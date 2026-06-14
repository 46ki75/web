import { component$ } from "@qwik.dev/core";
import { DocumentHead } from "@qwik.dev/router";
import { Privacy } from "~/components/main/privacy";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Privacy language="ja" />;
});

export const head: DocumentHead = ({ url }) => {
  const headBase = generateHead({
    url: url.toString(),
    title: "プライバシーポリシー",
    ogType: "profile",
    description: "ポートフォリオとブログ",
    language: "ja",
  });

  return headBase;
};
