<template>
  <div class="language" @click="toggle">
    <Icon icon="mdi:translate" color="#a4863e" />
    <div class="language-name">
      <ElmInlineText
        v-if="localeProperties.name"
        :text="localeProperties.name"
      />
    </div>
  </div>

  <Teleport to="body">
    <Transition>
      <div v-if="showCover" class="cover"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue/dist/iconify.js";

const showCover = ref(false);

const sleep = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

const { locale, localeProperties, setLocale } = useI18n();

const toggle = async () => {
  showCover.value = true;

  await sleep(150);

  if (locale.value === "en") {
    setLocale("ja");
  } else {
    setLocale("en");
  }

  await sleep(150);

  showCover.value = false;
};
</script>

<style scoped lang="scss">
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

.cover {
  position: fixed;
  z-index: 10000;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  background-color: #dee0e4;

  [data-theme="dark"] & {
    background-color: #3e434b;
  }
}

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
