import { component$, useContext, useSignal, useTask$ } from "@builder.io/qwik";

import styles from "./blog-search.module.scss";
import { BlogContext } from "~/context/blog";

import Fuse from "fuse.js";
import { ElmTextField } from "@elmethis/qwik";

export type BlogSearchProps = {
  language: string;
};

export const BlogSearch = component$<BlogSearchProps>(({ language }) => {
  const blogStore = useContext(BlogContext);

  const searchKeyword = useSignal("");
  const searchResults = useSignal<typeof blogStore.blogMeta>([]);

  useTask$(({ track }) => {
    track(() => searchKeyword.value);

    if (!(searchKeyword.value.trim() === "")) {
      const fuse = new Fuse(blogStore.blogMeta, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "description", weight: 0.3 },
          { name: "keywords", weight: 1 },
        ],
      });

      const results = fuse.search(searchKeyword.value)?.map(({ item }) => item);

      searchResults.value = results;
    } else {
      searchResults.value = [];
    }
  });

  return (
    <div class={styles["elm-my-something"]}>
      <ElmTextField value={searchKeyword} label="Keyword" icon="search" />

      {searchResults.value.map((blog) => (
        <div key={blog.page_id}>{blog.title}</div>
      ))}
    </div>
  );
});
