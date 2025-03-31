<template>
  <NuxtLoadingIndicator
    color="#a0d4b4"
    style="z-index: 100"
    :height="4"
    :duration="1000"
  />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>

  <Transition name="loadng">
    <div class="loading" v-if="isLoading">
      <div>
        <ElmDotLoadingIcon size="32px" />
      </div>
      <ElmInlineText text="LOADING..." />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ElmDotLoadingIcon, ElmInlineText } from "@elmethis/core";

useSeoMeta({
  title: "DEAFULT",
  ogTitle: "DEAFULT",
  author: "Chomolungma Shirayuki",
});

const { isLoading } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
});
</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  left: 0.25rem;
  bottom: 0.25rem;
  z-index: 100;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
  padding: 0.5rem;
  background-color: rgba(white, 0.8);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.8);
  }
}

.loadng-enter-to,
.loadng-leave-from {
  opacity: 1;
}

.loadng-enter-active,
.loadng-leave-active {
  transition: opacity 300ms;
  transition-timing-function: ease-out;
}

.loadng-enter-from,
.loadng-leave-to {
  opacity: 0;
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 150ms, transform 150ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>

<style lang="scss">
html {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: normal;
  font-style: normal;
  background-color: gray;
}

body {
  margin: 0;
  padding: 0;
  transition: background-color 200ms;
  background-color: #f2f2f2;

  [data-theme="dark"] & {
    background-color: #262626;
  }
}
</style>
