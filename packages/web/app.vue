<template>
  <NuxtLoadingIndicator
    color="#cdb57b"
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
const { locale } = useI18n();
const appConfig = useAppConfig();
const { fullPath } = useRoute();

useSeoMeta({
  title: appConfig.SITE_NAME,
  ogTitle: appConfig.SITE_NAME,
  author: "Ikuma Yamashita",
  articleAuthor: ["Ikuma Yamashita"],
  twitterSite: "@46ki75",
  ogUrl: `${appConfig.ENDPOINT}${fullPath}`,
});

useHead({
  htmlAttrs: { lang: locale },
});
</script>

<style lang="scss" scoped>
.v-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms, transform 200ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>

<style lang="scss">
* {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  box-shadow: none;
}

html {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 200ms;
  background-color: #f2f2f2;

  [data-theme="dark"] & {
    background-color: #25282e;
  }
}
</style>
