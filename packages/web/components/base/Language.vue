<template>
  <div :class="$style.language" @click="toggle">
    <ElmMdiIcon :d="mdiTranslate" />
    <div :class="$style['language-name']">
      <ElmInlineText
        v-if="localeProperties.name"
        :text="localeProperties.name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmMdiIcon } from "@elmethis/core";
import { mdiTranslate } from "@mdi/js";

const { locale, localeProperties, setLocale } = useI18n();

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
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 150ms;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(gray, 0.1);
  }
}

.language-name {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4rem;
}
</style>
