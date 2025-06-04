<template>
  <header class="header">
    <div class="header-left flex-center">
      <NuxtLinkLocale to="/" class="icon">
        <Icon icon="mdi:home" width="28px" />
      </NuxtLinkLocale>
    </div>

    <div v-if="isMobile" class="header-center flex-center">
      <NuxtLinkLocale to="/about" class="header-center-link flex-center">
        <Icon
          class="header-center-link-icon"
          icon="ix:user-profile"
          width="16px"
        />
        <ElmInlineText text="About" />
      </NuxtLinkLocale>

      <NuxtLinkLocale to="/blog" class="header-center-link flex-center">
        <Icon
          class="header-center-link-icon"
          icon="grommet-icons:article"
          width="16px"
        />
        <ElmInlineText text="Blog" />
      </NuxtLinkLocale>
    </div>

    <div class="header-right flex-center">
      <BaseLanguage />

      <ElmToggleTheme />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmToggleTheme } from "@elmethis/core";
import { Icon } from "@iconify/vue";
import { useMediaQuery } from "@vueuse/core";

const isMobile = useMediaQuery("(min-width: 1024px)");
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

.flex-center {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.header-left {
  margin-left: 0.5rem;
}

.header-center {
  user-select: none;
  gap: 1rem;
}

.header-center-link {
  text-decoration: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  opacity: 0.6;
  transition: opacity 150ms;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.header-center-link-icon {
  color: rgba(black, 0.8);

  [data-theme="dark"] & {
    color: rgba(white, 0.8);
  }
}

.header-right {
  margin-right: 0.5rem;
}

.icon {
  padding: 0.25rem;
  border-radius: 0.25rem;
  width: 28px;
  height: 28px;
  color: #b69545;
  transition: background-color 100ms;

  &:hover {
    background-color: rgba(gray, 0.15);
  }
}
</style>
