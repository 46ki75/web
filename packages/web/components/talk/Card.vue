<template>
  <a
    :class="$style.container"
    :href="url"
    target="_blank"
    rel="noreferrer noopener"
  >
    <div>
      <ElmImage :src="ogp" />
    </div>

    <div :class="$style.bottom">
      <div :class="$style['text-container']">
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
  box-sizing: border-box;
  width: clamp(320px, 100%, 480px);
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 0.25rem;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 150ms, background-color 150ms, transform 150ms;
  box-shadow: 0 0 0.125rem rgb(#3e434b, 0.3);

  &:hover {
    opacity: 0.9;
    background-color: rgba(#6987b8, 0.1);
    transform: translateX(-1px) translateY(-1px);
  }

  [data-theme="dark"] & {
    box-shadow: 0 0 0.125rem rgb(black, 0.5);
  }
}

.bottom {
  padding: 0.25rem;
  padding-bottom: 0.75rem;
  background-color: rgb(white, 0.5);
}

.text-container {
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
}

.text {
  opacity: 0.7;
}

.icon {
  flex-shrink: 0;
}
</style>
