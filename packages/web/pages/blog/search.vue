<template>
  <div :key="`/${locale}/blog/search`">
    <BlogMeta
      title="Search"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: locale === 'en' ? '/' : `/${locale}` },
        { text: 'Blog', href: locale === 'en' ? '/blog' : `/${locale}/blog` },
        {
          text: 'Search',
          href: locale === 'en' ? '/blog/search' : `/${locale}/blog/search`,
        },
      ]"
    />
    <div>
      <ElmTextField
        v-model="debouncedKeyword"
        label="検索キーワード"
        icon="pen"
      />

      <div class="tag-container">
        <ElmHeading :level="3" text="タグ一覧" disable-fragment-identifier />
        <div v-if="blogStore[locale].tags" class="tag-pool">
          <BlogTag
            v-for="tag in blogStore[locale].tags"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagSelect(tag.id)"
          />
        </div>
      </div>

      <div class="tag-container">
        <ElmHeading
          :level="3"
          text="選択されたタグ"
          disable-fragment-identifier
        />
        <TransitionGroup name="tag" class="tag-pool" tag="dev">
          <BlogTag
            v-for="tag in blogStore[locale].selectedTags"
            :id="tag.id"
            :key="tag.id"
            :label="tag.name"
            :color="tag.color"
            @click="blogStore.tagDeselect(tag.id)"
          />
        </TransitionGroup>
        <ElmButton block @click="blogStore.tagReset">
          <Icon icon="fluent:tag-reset-20-filled" height="20px" />
          選択されたタグのリセット</ElmButton
        >
      </div>

      <ElmHeading :level="3" text="検索結果" disable-fragment-identifier />

      <TransitionGroup name="search" class="search-results" tag="div">
        <div
          v-for="blog in blogStore[locale].searchedBlogs"
          :key="blog.id"
          class="search-results-item"
        >
          <BlogCard
            :id="blog.id"
            :title="blog.title"
            :description="blog.description"
            :tags="blog.tags"
            :created-at="blog.createdAt"
            :updated-at="blog.updatedAt"
            :locale="locale"
          />
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmButton, ElmHeading, ElmTextField } from "@elmethis/core";
import { Icon } from "@iconify/vue";
import { watchDebounced } from "@vueuse/core";

const { locale } = useI18n();

const blogStore = useBlogStore();

const debouncedKeyword = shallowRef<string>("");

watchDebounced(
  debouncedKeyword,
  () => {
    blogStore[locale.value].keyword = debouncedKeyword.value;
    blogStore.searchBlog();
  },
  { debounce: 300, maxWait: 3000 }
);

watch(
  [() => blogStore[locale.value].selectedTags],
  async () => {
    await nextTick();
    blogStore.searchBlog();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  blogStore.searchBlog();
});
</script>

<style lang="scss" scoped>
.tag-container {
  margin-block: 2rem;
}

.tag-pool {
  margin-block: 2rem;
  display: flex;
  flex-wrap: wrap;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-results-item {
  transition: flex 0.3s;
}

// Transition
.search-enter-to,
.search-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.search-enter-active,
.search-leave-active {
  transition: opacity 300ms, transform 300ms;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.tag-enter-to,
.tag-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.tag-enter-active,
.tag-leave-active {
  transition: opacity 100ms, transform 100ms;
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
