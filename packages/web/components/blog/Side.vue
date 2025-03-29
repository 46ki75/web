<template>
  <div class="side-container">
    <NuxtLink to="/blog/search" :prefetch="false" :style="{ all: 'unset' }">
      <ElmButton @click="() => {}" block>
        <Icon icon="material-symbols:search" height="24px" />
        <ElmInlineText text="記事を検索" />
      </ElmButton>
    </NuxtLink>

    <div class="card" v-for="blog in blogStore.getSideBlogs" :key="blog.id">
      <BlogCard
        :id="blog.id"
        :title="blog.title"
        :description="blog.description"
        :tags="blog.tags"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmButton, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

const blogStore = useBlogStore();
</script>

<style lang="scss" scoped>
@use "../../styles/variables";

.side-container {
  width: 100%;
  height: 100%;
}

.card {
  margin-block-start: 0.5rem;
}
</style>
