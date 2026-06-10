import { component$ } from "@qwik.dev/core";
import { DocumentHead } from "@qwik.dev/router";
import { Privacy } from "~/components/main/privacy";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Privacy language="en" />;
});

export const head: DocumentHead = ({ url }) => {
  const headBase = generateHead({
    url: url.toString(),
    title: "Privacy Policy",
    ogType: "profile",
    description: "Personal blog and portfolio",
    language: "en",
  });

  return headBase;
};
