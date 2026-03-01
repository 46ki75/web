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
    const { data } = await client.GET("/api/v2/blog", {
      params: {
        header: { "accept-language": language },
      },
    });

    if (data != null) {
      blogState.blogMeta = data;
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
