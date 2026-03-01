import {
  component$,
  Slot,
  useContext,
  useStylesScoped$,
  useTask$,
} from "@builder.io/qwik";

import styles from "./blog-layout.scoped.scss?inline";

import { BlogSide } from "~/components/blog/blog-side";
import { BlogMain } from "~/components/blog/blog-main";
import { client } from "../../../openapi/client";
import { BlogContext } from "~/context/blog";

export interface BlogLayoutProps {
  language: string;
}

export const BlogLayout = component$<BlogLayoutProps>(({ language }) => {
  useStylesScoped$(styles);

  const blogState = useContext(BlogContext);

  useTask$(async () => {
    if (blogState.blogMeta.length === 0) {
      const { data: blogMeta } = await client.GET("/api/v2/blog", {
        params: {
          header: { "accept-language": language },
        },
      });

      if (blogMeta != null) {
        blogState.blogMeta = blogMeta;
      }
    }

    if (blogState.tags.length === 0) {
      const { data: blogTags } = await client.GET("/api/v2/blog/tag", {});

      if (blogTags != null) {
        blogState.tags = blogTags;
      }
    }
  });

  return (
    <div class="blog-layout">
      <BlogMain>
        <Slot />
      </BlogMain>

      <BlogSide language={language} />
    </div>
  );
});
