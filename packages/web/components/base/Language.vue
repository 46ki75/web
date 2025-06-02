<template>
  <div :class="$style.language" @click="toggle">
    <div v-if="locale === 'en'">English</div>
    <div v-else>日本語</div>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n();

const toggle = async () => {
  if (locale.value === "en") {
    setLocale("ja");
  } else {
    setLocale("en");
  }
};
</script>

<style module lang="scss">
.language {
  display: flex;
}
</style>
