<template>
  <div class="icon-box">
    <a :href="`/feed/blog/rss-${language}.xml`" target="_blank">
      <Icon class="icon" icon="mdi:rss" color="gray" />
    </a>
    <a :href="`/feed/blog/atom-${language}.xml`" target="_blank">
      <Icon class="icon" icon="mdi:atom" color="gray" />
    </a>
    <a :href="`/feed/blog/feed-${language}.json`" target="_blank">
      <Icon class="icon" icon="mdi:code-json" color="gray" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue/dist/iconify.js";
export interface FeedProps {
  language: "en" | "ja";
}

withDefaults(defineProps<FeedProps>(), {});
</script>

<style scoped lang="scss">
.icon-box {
  width: 100%;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: opacity 200ms;

  &:hover {
    opacity: 0.5;
  }
}
</style>
