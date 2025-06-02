<template>
  <div :class="$style.language" @click="toggle">{{ locale }}</div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n();

const toggle = () => {
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
