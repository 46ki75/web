<template>
  <BaseHeader />

  <div class="bg">
    <slot />
    <ClientOnly>
      <ElmParallax
        image-url1="/image/bg-crimson.webp"
        image-url2="/image/bg-amber.webp"
      />
    </ClientOnly>
  </div>

  <BaseFooter />
</template>

<script setup lang="ts">
import { ElmParallax } from "@elmethis/vue";
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
