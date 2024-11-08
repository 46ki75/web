<template>
  <main class="main">
    <ElmBreadcrumb
      :links="[{ text: 'Home' }, { text: 'Blog' }, { text: 'Article' }]"
    />
    <ElmHeading1 text="HEADING1 PLACEHOLDER" />
    <NuxtPage />
  </main>
</template>

<script setup lang="ts">
import { ElmBreadcrumb, ElmHeading1 } from '@elmethis/core'
</script>

<style scoped lang="scss">
.main {
  width: 800px;
}
</style>
