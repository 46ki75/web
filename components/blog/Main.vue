<template>
  <main class="main">
    <ElmBreadcrumb
      :links="[
        {
          text: 'Home',
          onClick: () => {
            $router.push('/')
          }
        },
        {
          text: 'Blog',
          onClick: () => {
            $router.push('/blog')
          }
        },
        { text: 'Article' }
      ]"
    />
    <ElmHeading1 text="HEADING1 PLACEHOLDER" />
    <slot />
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
