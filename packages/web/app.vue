<template>
  <NuxtLoadingIndicator
    color="#59b57c"
    :height="4"
    :duration="2000"
    :throttle="50"
  />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "DEAFULT",
  ogTitle: "DEAFULT",
  author: "Chomolungma Shirayuki",
  articleAuthor: ["Chomolungma Shirayuki"],
  twitterSite: "@46ki75",
});
</script>

<style lang="scss" scoped>
.v-enter-to,
.v-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms, transform 200ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<style lang="scss">
html {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
  background-color: gray;
}

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
