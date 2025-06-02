<template>
  <header class="header">
    <NuxtLinkLocale to="/" class="icon">
      <Icon icon="mdi:home" width="28px" />
    </NuxtLinkLocale>

    <div class="right">
      <BaseLanguage />
      <NuxtLinkLocale to="/blog" class="icon">
        <Icon icon="mdi:book-open-page-variant-outline" width="28px" />
      </NuxtLinkLocale>
      <NuxtLinkLocale to="/about" class="icon">
        <Icon icon="mdi:account-box-multiple-outline" width="28px" />
      </NuxtLinkLocale>
      <ElmToggleTheme />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ElmToggleTheme } from "@elmethis/core";
import { Icon } from "@iconify/vue";
</script>

<style lang="scss" scoped>
@use "../../styles/variables";

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  padding: 0.5rem;
  height: #{variables.$header-height};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(1px);
  box-shadow: 0 0 0.125rem rgba(black, 0.2);
  background-color: rgba(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.3);
  }
}

.right {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  padding: 0.25rem;
  border-radius: 0.25rem;
  width: 28px;
  height: 28px;
  color: rgba(black, 0.7);

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }

  transition: background-color 100ms;

  &:hover {
    background-color: rgba(gray, 0.15);
  }
}
</style>
