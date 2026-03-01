import { component$, useContext } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

import { Meta } from "~/components/common/meta";
import { BlogContext } from "~/context/blog";

export default component$(() => {
  const blogState = useContext(BlogContext);

  return (
    <div>
      <div style={{ width: "800px", margin: "0 auto" }}>
        <Meta
          title="Welcome to Qwik"
          createdAt="2024-01-01"
          updatedAt="2024-06-01"
          image="https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image?lang=en"
        />

        <Link href="/blog/article/leather-shoes-painting/">
          <span style={{ fontSize: 64 }}>BLOG Sample</span>
        </Link>

        <button onClick$={() => blogState.count++}>{blogState.count}</button>
      </div>
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
