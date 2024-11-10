<template>
  <header class="header">
    <div class="icon-container"></div>
    <div class="icon-container"><ElmInlineText text="HEADER" /></div>
    <div class="icon-container"><ElmToggleTheme /></div>
  </header>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmToggleTheme } from '@elmethis/core'
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(black, 0.025);
  padding: 0.5rem;
  text-align: center;
  box-shadow: 0 0 0.125rem rgba(black, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(0.125rem);
}

.icon-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
