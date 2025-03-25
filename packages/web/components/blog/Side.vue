<template>
  <nav class="wrapper">
    <NuxtLink
      v-for="blog in blogSide.blogs"
      :to="`/blog/article/${blog.id}`"
      class="card"
    >
      <ElmImage
        :src="`https://dev-www.46ki75.com/api/blog/image/ogp/${blog.id}`"
      />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ElmImage } from "@elmethis/core";

const blogSide = useBlogSideStore();
</script>

<style lang="scss" scoped>
.wrapper {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card {
  transition: opacity 200ms, transform 200ms;

  &:hover {
    opacity: 0.9;
    transform: translateX(-1px) translateY(-1px);
  }

  &:active {
    opacity: 0.7;
    transform: translateX(1px) translateY(1px);
  }
}
</style>
