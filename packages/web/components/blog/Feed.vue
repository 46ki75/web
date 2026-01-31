<template>
  <div class="icon-box">
    <a :href="`/feed/blog/feed/rss/${language}`" target="_blank" class="a">
      <Icon class="icon" icon="mdi:rss" />
      <span class="label">RSS</span>
    </a>
    <a :href="`/feed/blog/feed/atom`" target="_blank" class="a">
      <Icon class="icon" icon="mdi:atom" />
      <span class="label">Atom</span>
    </a>
    <a :href="`/feed/blog/feed/json`" target="_blank" class="a">
      <Icon class="icon" icon="mdi:code-json" />
      <span class="label">Feed</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
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

.a {
  all: unset;
  position: relative;
  cursor: pointer;
  opacity: 0.5;
  transition:
    color 200ms,
    opacity 200ms;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    color: rgb(125 104 97);
  }

  &:hover {
    color: #be5d39;
    opacity: 1;

    .icon {
      color: #be5d39;
      opacity: 1;
    }
  }
}

.label {
  position: absolute;
  bottom: -4px;
  left: 0;
  font-size: 0.5rem;
  width: 1.5rem;
  text-align: center;
  user-select: none;
}
</style>
