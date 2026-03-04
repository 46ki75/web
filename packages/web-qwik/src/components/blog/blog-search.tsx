import { component$, useContext, useSignal, useTask$ } from "@builder.io/qwik";

import styles from "./blog-search.module.scss";
import { BlogContext } from "~/context/blog";

import Fuse from "fuse.js";
import { ElmTextField } from "@elmethis/qwik";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";

export type BlogSearchProps = {
  language: Language;
};

export const BlogSearch = component$<BlogSearchProps>(({ language }) => {
  const blogState = useContext(BlogContext);

  const searchKeyword = useSignal("");
  const searchResults = useSignal<(typeof blogState.blogMeta)[Language]>([]);

  useTask$(({ track }) => {
    track(() => searchKeyword.value);
    track(() => language);

    if (!(searchKeyword.value.trim() === "")) {
      console.log("searching", searchKeyword.value);
      console.log("blogMeta", blogState.blogMeta[language]);
      const fuse = new Fuse(blogState.blogMeta[language], {
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

      {searchResults.value?.map((blog, index) => (
        <BlogCard
          key={blog.slug}
          blog={blog}
          tags={blogState.tags?.filter((tag) => blog.tag_ids?.includes(tag.id))}
          language={language}
          delay={(index + 1) * 100}
        />
      ))}
    </div>
  );
});
