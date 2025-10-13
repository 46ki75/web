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

const DESCRIPTION = {
  ja: `${appConfig.SITE_NAME} は、ポートフォリオ、ブログ、オープンソース活動などを通じて技術や知見を発信する個人運営のサイトです。`,
  en: `${appConfig.SITE_NAME} is a personal website that shares technology and knowledge through portfolios, blogs, and open-source activities.`,
};

useSeoMeta({
  title: appConfig.SITE_NAME,
  ogTitle: appConfig.SITE_NAME,
  description: DESCRIPTION[locale.value],
  ogDescription: DESCRIPTION[locale.value],
  author: "Ikuma Yamashita",
  articleAuthor: ["Ikuma Yamashita"],
  twitterSite: "@46ki75",
  ogUrl: `${appConfig.ENDPOINT}${fullPath}`,
  ogImage: "/image/ogp.png",
});

useHead({
  htmlAttrs: { lang: locale },
});

const blogStore = useBlogStore();

await callOnce("BlogStore/init", async () => await blogStore.init());
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
html {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  box-shadow: none;
  scroll-behavior: smooth;
}

@keyframes body-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 200ms;
  background-color: #f2f2f2;
  animation-name: body-fade;
  animation-duration: 1000ms;
  animation-fill-mode: both;
  animation-iteration-count: 1;

  [data-theme="dark"] & {
    background-color: #25282e;
  }
}
</style>
