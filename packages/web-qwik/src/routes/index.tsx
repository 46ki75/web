import { component$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { LinkLocale } from "~/components/common/link-locale";

import { Meta } from "~/components/common/meta";
import { LayerDecoration } from "~/components/main/layer-decoration";

export default component$(() => {
  return (
    <div>
      <div style={{ width: "800px", margin: "0 auto" }}>
        <Meta
          title="Welcome to Qwik"
          createdAt="2024-01-01"
          updatedAt="2024-06-01"
          image="https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image?lang=en"
          links={[
            {
              text: "Home",
            },
          ]}
        />

        <LinkLocale href="/blog/article/leather-shoes-painting/">
          <span style={{ fontSize: 64 }}>BLOG Sample</span>
        </LinkLocale>

        <LayerDecoration />
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
