<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage :transition="{ mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "DEAFULT",
  ogTitle: "DEAFULT",
  author: "Chomolungma Shirayuki",
});
</script>

<style lang="scss" scoped>
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 150ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
body {
  margin: 0;
  padding: 0;

  transition: background-color 200ms;

  background-color: #f2f2f2;

  [data-theme="dark"] & {
    background-color: #262626;
  }
}
</style>
