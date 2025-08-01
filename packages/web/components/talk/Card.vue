<template>
  <div>
    <nuxt-link :to="url">
      <nuxt-img :src="ogp" />
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { NuxtImg } from "#components";

export interface TalkCardProps {
  /**
   * Link to the presentation slides.
   */
  url: string;

  /**
   * Date when the talk is presented.
   */
  date: string;

  /**
   * URL of the Open Graph image.
   */
  ogp: string;

  /**
   * Language in which the talk is presented.
   */
  language: "en" | "ja";
}

withDefaults(defineProps<TalkCardProps>(), {});
</script>

<style module lang="scss">
/** PLACEHOLDER */
</style>
