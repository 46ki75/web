<template>
  <header class="header">
    <div></div>
    <NuxtLink to="/" class="to-home">
      <ElmInlineText text="HOME" />
    </NuxtLink>
    <ElmToggleTheme />
  </header>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmToggleTheme } from "@elmethis/core";
</script>

<style lang="scss" scoped>
.header {
  box-sizing: border-box;
  padding: 0.5rem;
  height: 3.5rem;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  background-color: rgba(grey, 0.1);
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
