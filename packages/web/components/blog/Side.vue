<template>
  <nav class="wrapper">
    <NuxtLink to="/blog/search" :prefetch="false" :style="{ all: 'unset' }">
      <ElmButton @click="() => {}" block>
        <Icon icon="material-symbols:search" height="24px" />
        <ElmInlineText text="記事を検索" />
      </ElmButton>
    </NuxtLink>

    <NuxtLink
      v-for="blog in data"
      :to="`/blog/article/${blog.id}`"
      class="card"
    >
      <ElmImage
        :src="`${config.public.ENDPOINT}/api/blog/image/ogp/${blog.id}`"
      />

      <div class="text">
        <div><ElmInlineText size="1rem" bold :text="blog.title" /></div>
        <div class="description">
          <ElmInlineText size="0.8rem" :text="blog.description" />
        </div>

        <div class="tag" v-if="blog.tags">
          <BlogTag
            v-for="tag in blog.tags"
            :label="tag.name"
            :color="tag.color"
          />
        </div>

        <BlogDate :created-at="blog.createdAt" :updated-at="blog.updatedAt" />
      </div>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ElmButton, ElmImage, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const config = useRuntimeConfig();

const { data } = await useAsyncData("BlogSide", async () => {
  const response = await $fetch<{
    data: {
      blogList: Array<{
        id: string;
        title: string;
        description: string;
        tags: Array<{
          id: string;
          name: string;
          color: string;
        }>;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  }>(`${config.public.ENDPOINT}/api/graphql`, {
    method: "POST",
    body: {
      query: /* GraphQL */ `
        query ListBlogs {
          blogList {
            id
            title
            description
            status
            tags {
              id
              name
              color
            }
            createdAt
            updatedAt
          }
        }
      `,
    },
  });

  return response.data.blogList;
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card {
  all: unset;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  transition: opacity 200ms, transform 200ms, background-color 200ms;
  cursor: pointer;

  background-color: rgba(white, 0.25);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }

  &:hover {
    opacity: 0.9;
    transform: translateX(-1px) translateY(-1px);
    background-color: rgba(#6987b8, 0.15);
  }

  &:active {
    opacity: 0.7;
    transform: translateX(1px) translateY(1px);
    background-color: rgba(#59b57c, 0.15);
  }
}

.text {
  box-sizing: border-box;
  padding: 0.5rem 0.5rem 0rem 0.5rem;
}

.description {
  line-height: 1.3rem;
  opacity: 0.6;
  margin-block-end: 0.5rem;
}

.tag {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
</style>
