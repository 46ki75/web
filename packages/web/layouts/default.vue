<template>
  <BaseHeader />

  <div class="bg">
    <slot />
    <ElmParallax
      image-url1="/image/blog/bg1.webp"
      image-url2="/image/blog/bg2.webp"
    />
  </div>

  <BaseFooter />
</template>

<script setup lang="ts">
import { ElmParallax } from "@elmethis/core";
</script>

<style scoped lang="scss">
.bg {
  background-image: radial-gradient(
    circle,
    rgba(#25282e, 0.03) 10%,
    transparent 10%
  );
  background-size: 20px 20px;

  [data-theme="dark"] & {
    background-image: radial-gradient(
      circle,
      rgba(#bec2ca, 0.03) 10%,
      transparent 10%
    );
  }
}
</style>
