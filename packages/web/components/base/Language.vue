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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
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
  width: 3.5rem;
}
</style>
