<template>
  <div class="side-container">
    <div key="search" class="sticky">
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

    <ClientOnly>
      <div
        v-for="(blog, index) in blogStore.sideBlogs(locale)"
        :key="blog.slug"
        class="card"
        :style="{ '--delay': `${100 * index}ms` }"
      >
        <BlogCard
          :id="blog.slug"
          :title="blog.title"
          :description="blog.description"
          :tags="blogStore.getTags(blog.tag_ids)"
          :created-at="blog.created_at"
          :updated-at="blog.updated_at"
          :featured="blog.featured"
          :locale="locale"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ElmButton, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const { locale, t } = useI18n();

const blogStore = useBlogStore();
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
