<template>
  <div class="body">
    <main class="main">
      <slot />
    </main>

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
  padding-top: 1rem;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}

.main {
  box-sizing: border-box;
  width: 800px;
  padding: 0.5rem;
  box-shadow: 0 0 0.25rem rgba(black, 0.05);
  background-color: rgba(white, 0.1);
  [data-theme='dark'] & {
    background-color: rgba(black, 0.1);
  }
}
</style>
