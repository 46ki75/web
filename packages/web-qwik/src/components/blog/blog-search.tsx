import {
  component$,
  noSerialize,
  NoSerialize,
  useContext,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

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
  const fuseInstance = useSignal<NoSerialize<
    Fuse<(typeof blogState.blogMeta)[Language][number]>
  > | null>(null);

  useTask$(({ track }) => {
    track(() => searchKeyword.value);
    track(() => language);

    if (fuseInstance.value == null) {
      fuseInstance.value = noSerialize(
        new Fuse(blogState.blogMeta[language], {
          keys: [
            { name: "title", weight: 0.7 },
            { name: "description", weight: 0.3 },
            { name: "keywords", weight: 1 },
          ],
          threshold: 0.3,
        }),
      );
    }

    if (!(searchKeyword.value.trim() === "") && fuseInstance.value != null) {
      const results = fuseInstance.value
        .search(searchKeyword.value, { limit: 10 })
        ?.map(({ item }) => item);

      searchResults.value = results;
    } else {
      searchResults.value = [];
    }
  });

  return (
    <div class={styles["blog-search"]}>
      <ElmTextField value={searchKeyword} label="Keyword" icon="search" />

      <div class={styles["blog-search-result"]}>
        {(searchResults.value.length > 0
          ? searchResults.value
          : blogState.blogMeta[language]
        ).map((blog, index) => (
          <BlogCard
            key={blog.slug}
            blog={blog}
            tags={blogState.tags?.filter((tag) =>
              blog.tag_ids?.includes(tag.id),
            )}
            language={language}
            delay={(index + 1) * 100}
          />
        ))}
      </div>
    </div>
  );
});
