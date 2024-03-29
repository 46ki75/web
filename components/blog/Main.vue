<template>
  <BlogBreadcrumb :links="links" />
  <Heading1 :content="title" margin="0" />
  <div class="tag-container">
    <BlogTag
      v-if="tags != null"
      v-for="tag in tags"
      :label="tag.name"
      :color="tag.color"
    />
  </div>
  <BlogDate :created-at="createdAt" :updatedAt="updatedAt" />
  <Divider margin="0.35rem" />
  <ImageWithModal :src="image" />
  <Divider />
  <slot />
</template>

<script setup lang="ts">
import { Divider, Heading1, ImageWithModal } from 'elmethis'
import type { Select } from '~/models/frontend'

defineProps<{
  title: string
  createdAt: string
  updatedAt: string
  links: Array<{ label: string; href: string }>
  image: string
  tags?: Select[]
}>()
</script>

<style scoped lang="scss">
.tag-container {
  display: flex;
  flex-direction: row;
  margin-top: 0.25rem;
  gap: 0.5rem;
}

h1 {
  margin: 0;
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

img {
  animation: fade 0.4s both;
}
</style>
