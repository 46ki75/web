<template>
  <div class="center">
    <main class="main">
      <div class="main-inner">
        <div>
          <slot />
        </div>
        <BlogAuthor />
      </div>
      <div class="icon-container">
        <Icon icon="mdi:star-four-points-small" width="32px" />
        <Icon icon="ion:fish" width="32px" />
        <Icon icon="mdi:star-four-points-small" width="32px" />
      </div>
    </main>
    <nav class="side"><BlogSide /></nav>
    <ElmParallax
      image-url1="/image/blog/bg1.webp"
      image-url2="/image/blog/bg2.webp"
    />
    <ElmPagetop />
  </div>
</template>

<script setup lang="ts">
import { ElmParallax, ElmPagetop } from "@elmethis/core";
import { Icon } from "@iconify/vue";
</script>

<style lang="scss" scoped>
@use "../styles/variables";

.center {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  gap: 0.5rem;

  justify-content: center;
  align-items: flex-start;

  // mobile
  flex-direction: column;
  padding: 0.25rem;

  // desktop
  @media (min-width: variables.$breakpoint-tablet) {
    flex-direction: row;
    padding: 0.5rem;
  }
}

.main {
  // mobile
  flex-grow: 1;
  width: 100%;
  max-width: 100%;

  // desktop
  @media (min-width: variables.$breakpoint-tablet) {
    flex-grow: 65;
    width: 65%;
    max-width: 840px;
  }
}

.main-inner {
  padding: 0.5rem;
  width: 100%;
  overflow: hidden;
  border-radius: 0.25rem;
  box-sizing: border-box;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  background-color: rgba(white, 0.3);
  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }
}

.icon-container {
  width: 100%;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;

  opacity: 0.75;
  color: grey;
}

.side {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;

  // mobile
  width: 100%;
  flex-grow: 1;
  max-width: 100%;

  // desctop
  @media (min-width: variables.$breakpoint-tablet) {
    flex-grow: 35;
    width: 35%;
    max-width: 420px;
  }
}
</style>
