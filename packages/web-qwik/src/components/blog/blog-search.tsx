import {
  $,
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
import {
  ElmButton,
  ElmHeading,
  ElmInlineText,
  ElmMdiIcon,
  ElmTextField,
} from "@elmethis/qwik";
import { Language } from "~/types";
import { BlogCard } from "./blog-card";
import { Tag } from "../common/tag";
import { mdiTagRemove } from "@mdi/js";

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
    track(() => blogState.selectedTagIds);

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

    if (fuseInstance.value != null) {
      const results =
        fuseInstance.value
          .search(searchKeyword.value, { limit: 10 })
          ?.map(({ item }) => item)
          .filter((blog) =>
            blogState.selectedTagIds.every((tagId) =>
              blog.tag_ids?.includes(tagId),
            ),
          ) ?? [];

      searchResults.value = results;
    } else {
      searchResults.value = [];
    }
  });

  const handleTagAdd = $((tagId: string) => {
    if (!blogState.selectedTagIds.includes(tagId)) {
      blogState.selectedTagIds = [...blogState.selectedTagIds, tagId];
    }
  });

  const handleTagRemove = $((tagId: string) => {
    blogState.selectedTagIds = blogState.selectedTagIds.filter(
      (id) => id !== tagId,
    );
  });

  const handleTagReset = $(() => {
    blogState.selectedTagIds = [];
  });

  return (
    <div class={styles["blog-search"]}>
      <ElmTextField value={searchKeyword} label="Keyword" icon="search" />

      <ElmHeading level={2}>Tags</ElmHeading>

      <div class={styles["tag-pool"]}>
        {blogState.tags.map((tag) => (
          <span
            key={tag.id}
            class={[styles["tag-wrapper"], styles["add"]]}
            onClick$={() => handleTagAdd(tag.id)}
          >
            <Tag
              name={language === "en" ? tag.name_en : tag.name_ja}
              src={tag.icon_url!}
            />
          </span>
        ))}
      </div>

      <ElmHeading level={2}>Selected Tags</ElmHeading>

      <div
        class={[
          styles["tag-pool"],
          {
            [styles["empty"]]: blogState.selectedTagIds.length === 0,
          },
        ]}
      >
        {blogState.selectedTagIds.map((tagId) => {
          const tag = blogState.tags.find((t) => t.id === tagId);
          if (tag == null) return null;

          return (
            <span
              key={tag.id}
              class={[styles["tag-wrapper"], styles["remove"]]}
              onClick$={() => handleTagRemove(tag.id)}
            >
              <Tag
                name={language === "en" ? tag.name_en : tag.name_ja}
                src={tag.icon_url!}
              />
            </span>
          );
        })}
      </div>

      <ElmButton onClick$={handleTagReset} block>
        <ElmMdiIcon d={mdiTagRemove} />
        <ElmInlineText>Reset Tags</ElmInlineText>
      </ElmButton>

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
