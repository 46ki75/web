<script setup lang="ts">
import { ElmCubeIcon } from "@elmethis/core";
const { locale } = useI18n();
await navigateTo(locale.value === "en" ? "/blog" : `/${locale.value}/blog`);
</script>

<template>
  <div key="/">
    <div :class="$style.empty">
      <ElmCubeIcon />
    </div>
  </div>
</template>

<style module lang="scss">
.empty {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
