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
  box-sizing: border-box;
  width: 800px;
  padding: 0.5rem;
  box-shadow: 0 0 0.25rem rgba(black, 0.05);
  background-color: rgba(white, 0.1);
  [data-theme='dark'] & {
    background-color: rgba(black, 0.1);
  }
}
</style>
