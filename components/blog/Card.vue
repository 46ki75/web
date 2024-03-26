<template>
  <a class="card" :href="href">
    <img class="image" :src="image" alt="Image of OGP" />
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
  </a>
</template>

<script setup lang="ts">
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
  background-color: rgba(255, 255, 255, 0.4);

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
