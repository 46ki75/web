<template>
  <div :key="id" class="container">
    <NuxtLinkLocale class="top" :to="`/blog/article/${id}`" :locale="locale">
      <div class="image">
        <ElmImage :src="`/_notion/blog/image/${id}/${locale}/ogp.webp`" />
      </div>

      <div class="text-container">
        <div class="title">
          <ElmInlineText :text="title" bold />
        </div>
        <div class="description">
          <ElmInlineText :text="description" size="0.8rem" />
        </div>
        <div class="date">
          <Icon
            icon="mdi:star"
            color="#cdb57b"
            height="1.25rem"
            :style="{ opacity: featured ? 1 : 0 }"
          />
          <BaseDate :created-at="createdAt" :updated-at="updatedAt" />
        </div>
      </div>
    </NuxtLinkLocale>

    <div class="bottom">
      <NuxtLinkLocale
        v-for="tag in tags"
        :key="tag.id"
        :to="`/blog/search`"
        :style="{ all: 'unset' }"
        :prefetch="false"
        :locale="locale"
      >
        <BlogTag
          :id="tag.id"
          :key="tag.id"
          :name="tag.name"
          :icon-url="tag.iconUrl"
          @click="handleTagClick(tag.id)"
        />
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmImage, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

interface BlogSearchResultProps {
  id: string;
  title: string;
  description: string;
  tags: Array<{
    id: string;
    name: string;
    iconUrl?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  locale: "en" | "ja";
}

defineProps<BlogSearchResultProps>();

const blogStore = useBlogStore();

const handleTagClick = (tagId: string) => {
  blogStore.tagReset();
  blogStore.tagSelect(tagId);
};
</script>

<style lang="scss" scoped>
@use "../../styles/variables";

.container {
  container-type: inline-size;
  overflow: hidden;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgb(black, 0.25);
}

.top {
  all: unset;
  display: flex;
  cursor: pointer;
  transition: opacity 200ms, transform 200ms, background-color 200ms;
  background-color: rgb(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgb(black, 0.3);
    box-shadow: 0 0 0.125rem rgb(black, 0.5);
  }

  &:hover {
    opacity: 0.9;
    transform: translateX(-1px) translateY(-1px);
    background-color: rgba(#aebed9, 0.15);
  }

  &:active {
    opacity: 0.7;
    transform: translateX(1px) translateY(1px);
    background-color: rgba(#a0d4b4, 0.15);
  }

  // Mobile
  flex-direction: column;

  // Desktop
  @container (min-width: #{variables.$breakpoint-mobile}) {
    flex-direction: row;
  }
}

.image {
  // Mobile
  width: 100%;

  // Desktop
  @container (min-width: #{variables.$breakpoint-mobile}) {
    width: 30%;
  }
}

.text-container {
  padding: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.25rem;

  // Mobile
  width: 100%;

  // Desktop
  @container (min-width: #{variables.$breakpoint-mobile}) {
    // padding: 0.25rem 0.5rem 0.25rem 0.5rem;
    width: 70%;
  }
}

.description {
  opacity: 0.6;
  line-height: 1rem;
}

.date {
  display: flex;
  justify-content: space-between;
  margin-block-start: 0.25rem;
}

.bottom {
  border-top: solid 1px rgb(gray, 0.3);
  background-color: rgb(white, 0.5);

  [data-theme="dark"] & {
    background-color: rgb(black, 0.5);
  }
}
</style>
