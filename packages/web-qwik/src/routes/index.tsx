import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import { Date } from "~/components/common/date";

export default component$(() => {
  return (
    <div>
      <Date createdAt="2024-01-01" updatedAt="2024-06-01" />
      <Link href="/blog/article/leather-shoes-painting/">BLOG Sample</Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
