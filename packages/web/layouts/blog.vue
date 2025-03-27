<template>
  <div class="center">
    <main class="main">
      <slot />
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
  overflow: hidden;
  border-radius: 0.25rem;
  box-sizing: border-box;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  background-color: rgba(white, 0.3);
  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }

  // mobile
  padding: 0.5rem;
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
