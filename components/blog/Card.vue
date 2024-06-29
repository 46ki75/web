<template>
  <NuxtLink
    class="card"
    :to="href"
    :style="{ animationDelay: animationDelay + 's' }"
  >
    <ImageWithFallback class="image" :src="image" alt="OGP Image " />
    <!-- <img/> -->
    <div class="typography">
      <span class="title">{{ title }}</span>
      <span class="description">{{ description }}</span>
    </div>
    <div class="tags">
      <BlogTag
        v-for="tag in tags"
        :label="tag.name"
        :color="tag.color"
        href="/"
      />
    </div>
    <BlogDate :created-at="createdAt" :updated-at="updatedAt" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { ImageWithFallback } from 'elmethis'
import { type Select } from '~/models/frontend'

withDefaults(
  defineProps<{
    title: string
    description: string
    image?: string
    href: string
    tags: Select[]
    createdAt: string
    updatedAt: string
    animationDelay: number
  }>(),
  { image: '/images/noimage.webp' }
)
</script>

<style scoped lang="scss">
.card {
  all: unset;
  display: block;

  width: 100%;
  box-shadow: 0 0 0.125rem rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.8);

  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.65;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.image {
  width: 100%;
}

.typography {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .title {
    user-select: none;
    font-size: 1.125rem;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.8);
  }

  .description {
    user-select: none;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.5);
    word-break: break-all;
  }
}

.tags {
  width: 100%;
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.25rem;
}
</style>
