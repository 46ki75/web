<template>
  <ElmList list-style="unordered" :class="$style.text">
    <slot />
  </ElmList>
</template>

<script setup lang="ts">
import { ElmList } from "@elmethis/core";
</script>

<style module lang="scss">
.text {
  color: var(--color, #606875);

  &::selection {
    color: #cccfd5;
    background-color: var(--color, #3e434b);
  }

  [data-theme="dark"] & {
    color: var(--color, #b0b5be);

    &::selection {
      color: #3e434b;
      background-color: var(--color, #cccfd5);
    }
  }
}
</style>
