<template>
  <div class="side-container">
    <div class="sticky">
      <NuxtLinkLocale
        to="/blog/search"
        :prefetch="false"
        :style="{ all: 'unset' }"
      >
        <ElmButton block @click="() => {}">
          <Icon icon="mdi:folder-search-outline" height="24px" />
          <ElmInlineText text="記事を検索" />
        </ElmButton>
      </NuxtLinkLocale>
    </div>

    <div v-for="blog in blogStore[locale].blogs" :key="blog.id" class="card">
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
  </div>
</template>

<script setup lang="ts">
import { ElmButton, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const { locale } = useI18n();

const blogStore = useBlogStore();

// const getSideBlogs = (
//   blogs?: typeof blogStore.en.blogs
// ): typeof blogStore.en.blogs => {
//   if (!blogs) return [];
//   return blogs
//     .sort(
//       (pre, next) =>
//         new Date(next.createdAt).getTime() - new Date(pre.createdAt).getTime()
//     )
//     .slice(0, 10);
// };
</script>

<style lang="scss" scoped>
@use "../../styles/variables";

.side-container {
  width: 100%;
  height: 100%;
}

.sticky {
  @media (min-width: variables.$breakpoint-tablet) {
    width: 100%;
    position: sticky;
    top: 0;
    opacity: 0.98;
    z-index: 5;
    background-color: #f2f2f2;

    [data-theme="dark"] & {
      background-color: #262626;
    }
  }
}

.card {
  margin-block-start: 0.5rem;
}
</style>
