<template>
  <header class="header">
    <div class="header-left flex-center">
      <NuxtLinkLocale to="/" class="logo">
        <img alt="Logo" src="/brand/logo.svg" class="logo-image" />
      </NuxtLinkLocale>
    </div>

    <ClientOnly>
      <div v-if="isMobile" class="header-center flex-center">
        <NuxtLinkLocale to="/about" class="header-center-link flex-center">
          <Icon
            class="header-center-link-icon"
            icon="ix:user-profile-filled"
            width="16px"
          />
          <ElmInlineText text="About" />
        </NuxtLinkLocale>

        <Icon
          class="header-center-link-icon"
          icon="ci:line-l"
          width="16px"
          color="gray"
        />

        <NuxtLinkLocale to="/blog" class="header-center-link flex-center">
          <Icon
            class="header-center-link-icon"
            icon="material-symbols:article"
            width="16px"
          />
          <ElmInlineText text="Blog" />
        </NuxtLinkLocale>

        <Icon
          class="header-center-link-icon"
          icon="ci:line-l"
          width="16px"
          color="gray"
        />

        <NuxtLinkLocale to="/talks" class="header-center-link flex-center">
          <Icon
            class="header-center-link-icon"
            icon="mdi:account-voice"
            width="16px"
          />
          <ElmInlineText text="Talks" />
        </NuxtLinkLocale>
      </div>
    </ClientOnly>

    <div class="header-right flex-center">
      <BaseLanguage />

      <ElmToggleTheme />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ElmInlineText, ElmToggleTheme } from "@elmethis/vue";
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
  padding: 0.5rem 0;
  height: #{variables.$header-height};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(1px);
  box-shadow: 0 0 0.125rem rgb(black, 0.2);
  background-color: rgb(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgb(black, 0.3);
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
  gap: 0.25rem;
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
  color: rgb(black, 0.8);

  [data-theme="dark"] & {
    color: rgb(white, 0.8);
  }
}

.header-right {
  margin-right: 0.5rem;
}

.logo {
  padding: 0.5rem 0.25rem;
  border-radius: 0.25rem;
  height: 1.5rem;
  transition: opacity 200ms;

  &:hover {
    opacity: 0.6;
  }
}

.logo-image {
  height: 100%;
}
</style>
