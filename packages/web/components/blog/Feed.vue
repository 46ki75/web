<template>
  <div class="icon-box">
    <a :href="`/feed/blog/rss-${language}.xml`" target="_blank">
      <Icon class="icon" icon="mdi:rss" />
    </a>
    <a :href="`/feed/blog/atom-${language}.xml`" target="_blank">
      <Icon class="icon" icon="mdi:atom" />
    </a>
    <a :href="`/feed/blog/feed-${language}.json`" target="_blank">
      <Icon class="icon" icon="mdi:code-json" />
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
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  align-items: center;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(125 104 97);
  opacity: 0.5;
  transition: color 200ms, opacity 200ms;

  &:hover {
    color: #be5d39;
    opacity: 1;
  }
}
</style>
