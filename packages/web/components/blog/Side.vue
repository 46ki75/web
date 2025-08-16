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
          <ElmInlineText :text="t('blog.side.searchButton')" />
        </ElmButton>
      </NuxtLinkLocale>
    </div>

    <div
      v-for="(blog, index) in getSideBlogs(blogStore[locale].blogs)"
      :key="blog.id"
      class="card"
      :style="{ '--delay': `${100 * index}ms` }"
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
  </div>
</template>

<script setup lang="ts">
import { ElmButton, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const { locale, t } = useI18n();

const blogStore = useBlogStore();

const getSideBlogs = (
  blogs?: typeof blogStore.en.blogs
): typeof blogStore.en.blogs => {
  if (!blogs) return [];
  return blogs
    .sort(
      (pre, next) =>
        new Date(next.createdAt).getTime() - new Date(pre.createdAt).getTime()
    )
    .slice(0, 10);
};
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

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.card {
  margin-block-start: 0.5rem;
  animation-name: fade-in;
  animation-duration: 400ms;
  animation-delay: var(--delay);
  animation-fill-mode: both;
}
</style>
