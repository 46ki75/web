<template>
  <nav class="wrapper">
    <NuxtLink
      v-for="blog in blogSide.blogs"
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
      </div>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ElmImage, ElmInlineText } from "@elmethis/core";

const blogSide = useBlogSideStore();

const config = useRuntimeConfig();
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
  background-color: rgba(white, 0.25);
  transition: opacity 200ms, transform 200ms;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    transform: translateX(-1px) translateY(-1px);
  }

  &:active {
    opacity: 0.7;
    transform: translateX(1px) translateY(1px);
  }
}

.text {
  box-sizing: border-box;
  padding: 0.5rem;
}

.description {
  line-height: 1.3rem;
  opacity: 0.6;
}
</style>
