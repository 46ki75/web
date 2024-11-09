<template>
  <div class="body">
    <BlogMain>
      <slot />
    </BlogMain>
    <BlogSide />
    <ElmParallax
      image-url1="/images/blog/bg1.webp"
      image-url2="/images/blog/bg2.webp"
    />
  </div>
</template>

<script setup lang="ts">
import { ElmParallax } from '@elmethis/core'
</script>

<style scoped lang="scss">
.body {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}
</style>
