<template>
  <NuxtLinkLocale :class="$style.card" :to="to">
    <header>
      <Icon v-if="iconifyIcon" :icon="iconifyIcon" :class="$style.icon" />
      <img v-else :class="$style.icon" :src="src" alt="icon" />
      <ElmInlineText :text="title" bold />
    </header>
    <div :class="$style['body']">
      <ElmInlineText :text="description" />
      <div :class="$style['detail']">
        <Icon icon="mynaui:chevron-right-solid" color="#8e3636" />
        <ElmInlineText text="View Details" color="#8e3636" />
      </div>
    </div>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import { NuxtLinkLocale } from "#components";
import { ElmInlineText } from "@elmethis/vue";
import { Icon } from "@iconify/vue";

export interface CardProps {
  to: string;
  title: string;
  description: string;
  iconifyIcon?: string;
  src?: string;
}

withDefaults(defineProps<CardProps>(), {
  iconifyIcon: undefined,
  src: undefined,
});
</script>

<style module lang="scss">
.card {
  all: unset;
  position: relative;
  user-select: none;
  cursor: pointer;
  box-sizing: border-box;
  padding: 1rem 1.5rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 380px;
  background: linear-gradient(
    to bottom right,
    rgba(#c9699e, 0.06),
    rgba(#c56565, 0.06),
    rgba(#d48b70, 0.06),
    rgba(#cdb57b, 0.06)
  );
  backdrop-filter: blur(4px);
  box-shadow: 0 0 0.125rem rgb(black, 0.3);
  transition: opacity 200ms, transform 200ms;

  [data-theme="dark"] & {
    box-shadow: 0 0 0.125rem rgb(black, 0.5);
  }

  &:hover {
    opacity: 0.75;
    transform: translateX(-1px) translateY(-1px);
  }

  &:active {
    opacity: 0.25;
    transform: translateX(1px) translateY(1px);
  }

  &::after {
    position: absolute;
    content: "";
    height: calc(100% - 1.5rem);
    width: calc(100% - 1rem);
    top: 0.75rem;
    left: 0.5rem;
    border-left: 1px dashed rgb(gray, 0.4);
    border-right: 1px dashed rgb(gray, 0.4);
  }

  header {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: center;
  }
}

.body {
  height: 100%;
  opacity: 0.6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.detail {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.75;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
