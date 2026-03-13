import { component$ } from "@builder.io/qwik";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { Privacy } from "~/components/main/privacy";
import { generateHead } from "~/utils/common";

export default component$(() => {
  return <Privacy language="en" />;
});

export const useUrl = routeLoader$(({ url }) => url.toString());

export const head: DocumentHead = ({ resolveValue }) => {
  const url = resolveValue(useUrl);

  const headBase = generateHead({
    url,
    title: "Privacy Policy",
    ogType: "profile",
    description: "Personal blog and portfolio",
    language: "en",
  });

  return headBase;
};
