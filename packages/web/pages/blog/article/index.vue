<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
const { locale } = useI18n();
await navigateTo(locale.value === "en" ? "/blog" : `${locale}/blog`);
</script>
