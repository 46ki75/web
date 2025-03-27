<template>
  <div class="side-container">
    <NuxtLink to="/blog/search" :prefetch="false" :style="{ all: 'unset' }">
      <ElmButton @click="() => {}" block>
        <Icon icon="material-symbols:search" height="24px" />
        <ElmInlineText text="記事を検索" />
      </ElmButton>
    </NuxtLink>

    <BlogCard
      v-for="blog in data"
      :id="blog.id"
      :title="blog.title"
      :description="blog.description"
      :tags="blog.tags"
      :created-at="blog.createdAt"
      :updated-at="blog.updatedAt"
    />
  </div>
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
@use "../../styles/variables";

.side-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
