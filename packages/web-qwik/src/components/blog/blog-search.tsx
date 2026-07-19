import {
  createAutoAnimate,
  ElmButton,
  ElmCollapse,
  ElmHeading,
  ElmMdiIcon,
  ElmTextField,
} from "@elmethis/solid";
import { mdiTagRemove } from "@mdi/js";
import { useNavigate } from "@solidjs/router";
import Fuse from "fuse.js";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";

import { Meta } from "../common/meta";
import { Tag } from "../common/tag";
import { useBlog } from "~/context/blog";
import { useI18n } from "~/i18n/context";
import { BlogCard } from "./blog-card";

import styles from "./blog-search.module.css";

export function BlogSearch() {
  const blogState = useBlog();
  const { t, locale, localizePath } = useI18n();
  const navigate = useNavigate();
  const selectedTagsAnimation = createAutoAnimate<HTMLDivElement>();
  const resultsAnimation = createAutoAnimate<HTMLDivElement>();
  const [searchKeyword, setSearchKeyword] = createSignal("");
  const [debouncedKeyword, setDebouncedKeyword] = createSignal("");

  const fuse = createMemo(
    () =>
      new Fuse(blogState.blogMeta, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "description", weight: 0.3 },
          { name: "keywords", weight: 1 },
        ],
        threshold: 0.3,
      }),
  );

  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  createEffect(() => {
    const keyword = searchKeyword();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setDebouncedKeyword(keyword), 300);
  });
  onCleanup(() => clearTimeout(searchTimer));

  const searchResults = createMemo(() => {
    const keyword = debouncedKeyword().trim();
    const matches = keyword
      ? fuse()
          .search(keyword, { limit: 10 })
          .map((result) => result.item)
      : blogState.blogMeta;

    return matches.filter((blog) =>
      blogState.selectedTagIds().every((tagId) => blog.tag_ids.includes(tagId)),
    );
  });

  const visibleResults = createMemo(() =>
    searchKeyword().trim() === "" && blogState.selectedTagIds().length === 0
      ? blogState.blogMeta
      : searchResults(),
  );

  const addTag = (tagId: string) => {
    if (!blogState.selectedTagIds().includes(tagId)) {
      blogState.setSelectedTagIds((current) => [...current, tagId]);
    }
  };
  const removeTag = (tagId: string) =>
    blogState.setSelectedTagIds((current) =>
      current.filter((id) => id !== tagId),
    );

  return (
    <>
      <Meta
        title="Blog Search"
        createdAt="2026-03-05"
        updatedAt="2026-03-05"
        links={[
          {
            text: t("common.home"),
            onClick: () => navigate(localizePath("/")),
          },
          {
            text: t("common.blog"),
            onClick: () => navigate(localizePath("/blog")),
          },
          {
            text: t("common.search"),
            onClick: () => navigate(localizePath("/blog/search")),
          },
        ]}
      />
      <div class={styles["blog-search"]}>
        <div style={{ "margin-block": "2rem" }}>
          <ElmTextField
            value={searchKeyword()}
            label="Keyword"
            onInput={(event) => setSearchKeyword(event.currentTarget.value)}
          />
        </div>
        <ElmHeading level={2}>{t("common.tags")}</ElmHeading>
        <div class={styles["tag-pool"]}>
          <For each={blogState.tags}>
            {(tag) => (
              <span
                class={`${styles["tag-wrapper"]} ${styles.add}`}
                onClick={() => addTag(tag.id)}
              >
                <Tag
                  name={locale() === "en" ? tag.name_en : tag.name_ja}
                  src={tag.icon_url ?? ""}
                  style={{
                    "view-transition-name": `blog-search-tag-pool-${tag.id}`,
                  }}
                />
              </span>
            )}
          </For>
        </div>
        <ElmHeading level={2}>{t("common.selectedTags")}</ElmHeading>
        <ElmCollapse isOpen={blogState.selectedTagIds().length > 0}>
          <div
            ref={selectedTagsAnimation.ref}
            class={styles["tag-pool"]}
            classList={{
              [styles.empty]: blogState.selectedTagIds().length === 0,
            }}
          >
            <For each={blogState.selectedTagIds()}>
              {(tagId) => {
                const tag = () =>
                  blogState.tags.find((candidate) => candidate.id === tagId);
                return (
                  <Show when={tag()} keyed>
                    {(selectedTag) => (
                      <span
                        class={`${styles["tag-wrapper"]} ${styles.remove}`}
                        onClick={() => removeTag(selectedTag.id)}
                      >
                        <Tag
                          name={
                            locale() === "en"
                              ? selectedTag.name_en
                              : selectedTag.name_ja
                          }
                          src={selectedTag.icon_url ?? ""}
                          style={{
                            "view-transition-name": `blog-search-tag-selected-${selectedTag.id}`,
                          }}
                        />
                      </span>
                    )}
                  </Show>
                );
              }}
            </For>
          </div>
        </ElmCollapse>
        <div style={{ "margin-block": "1rem" }}>
          <ElmButton
            type="button"
            onClick={() => blogState.setSelectedTagIds([])}
            block
          >
            <ElmMdiIcon class={styles.icon} d={mdiTagRemove} />
            {t("common.resetTags")}
          </ElmButton>
        </div>
        <ElmHeading level={2}>{t("common.searchResults")}</ElmHeading>
        <div ref={resultsAnimation.ref} class={styles["blog-search-result"]}>
          <For each={visibleResults()}>
            {(blog) => (
              <BlogCard
                blog={blog}
                tags={blogState.tags.filter((tag) =>
                  blog.tag_ids.includes(tag.id),
                )}
                style={{
                  "view-transition-name": `blog-search-blog-card-${blog.page_id}`,
                }}
              />
            )}
          </For>
        </div>
      </div>
    </>
  );
}
