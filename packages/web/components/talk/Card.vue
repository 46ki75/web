<template>
  <a
    :class="$style.container"
    :href="url"
    target="_blank"
    rel="noreferrer noopener"
  >
    <div :class="$style.image">
      <ElmImage :src="ogp" />
    </div>

    <div>
      <ElmInlineText :text="title" bold />
    </div>

    <div :class="$style['text-container']">
      <Icon :class="$style.icon" icon="mdi:calendar-blank" color="#a4863e" />
      <ElmInlineText :class="$style.text" :text="date" />
      <Icon :class="$style.icon" icon="mdi:translate" color="#a4863e" />
      <ElmInlineText :class="$style.text" :text="language" />
    </div>

    <div :class="$style['text-container']">
      <Icon :class="$style.icon" icon="mdi:location" color="#a4863e" />
      <ElmInlineText :class="$style.text" :text="location" />
    </div>
  </a>
</template>

<script setup lang="ts">
import { ElmImage, ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

export interface TalkCardProps {
  /**
   * Link to the presentation slides.
   */
  url: string;

  title: string;

  /**
   * Date when the talk is presented.
   */
  date: string;

  location: string;

  /**
   * URL of the Open Graph image.
   */
  ogp: string;

  /**
   * Language in which the talk is presented.
   */
  language: string;
}

withDefaults(defineProps<TalkCardProps>(), {});
</script>

<style module lang="scss">
.container {
  all: unset;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 0.25rem;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 150ms, background-color 150ms, transform 150ms;

  &:hover {
    opacity: 0.9;
    background-color: rgba(#6987b8, 0.1);
    transform: translateX(-1px) translateY(-1px);
  }
}

.text-container {
  padding: 0.25rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
}

.text {
  opacity: 0.7;
}

.image {
  border-radius: 0.25rem;
  overflow: hidden;
}

.icon {
  flex-shrink: 0;
}
</style>
