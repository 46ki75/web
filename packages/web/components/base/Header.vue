<template>
  <header class="header">
    <div></div>
    <NuxtLink to="/" class="to-home">
      <ElmInlineText text="HOME" />
    </NuxtLink>
    <ElmToggleTheme />
  </header>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmToggleTheme } from "@elmethis/core";
</script>

<style lang="scss" scoped>
@use "../../styles/variables";

.header {
  position: sticky;
  top: 0;
  z-index: 10;

  box-sizing: border-box;
  padding: 0.5rem;
  height: #{variables.$header-height};

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  backdrop-filter: blur(1px);
  box-shadow: 0 0 0.125rem rgba(black, 0.2);
  background-color: rgba(white, 0.3);
  [data-theme="dark"] & {
    background-color: rgba(black, 0.3);
  }
}

.to-home {
  all: unset;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  opacity: 1;
  cursor: pointer;

  transition: background-color 100ms, opacity 100ms;

  &:hover {
    background-color: rgba(#6987b8, 0.1);
  }

  &:active {
    opacity: 0.5;
  }
}
</style>
