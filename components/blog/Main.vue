<template>
  <BlogBreadcrumb :links="links" />
  <Heading1 :content="title" margin="0" />
  <BlogDate :created-at="createdAt" :updatedAt="updatedAt" />
  <Divider margin="0.35rem" />
  <ImageWithModal :src="image" />
  <Divider />
  <slot />
</template>

<script setup lang="ts">
import { Divider, Heading1, ImageWithModal } from 'elmethis'

defineProps<{
  title: string
  createdAt: string
  updatedAt: string
  links: Array<{ label: string; href: string }>
  image: string
}>()
</script>

<style scoped lang="scss">
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
