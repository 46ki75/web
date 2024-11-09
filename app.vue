<template>
  <Suspense>
    <template #default>
      <NuxtLayout name="default">
        <NuxtPage />
      </NuxtLayout>
    </template>

    <template #fallback>
      <Fallback />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'ja'
  }
})
</script>

<style lang="scss">
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 200ms;

  background-color: rgba(0, 0, 0, 0.05);
  [data-theme='dark'] & {
    background-color: rgba(0, 0, 0, 0.85);
  }
}
</style>
