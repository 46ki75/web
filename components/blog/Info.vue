<template>
  <ElmBreadcrumb
    :links="
      links.map((link) => ({
        text: link.text,
        onClick: () => $router.push(link.path)
      }))
    "
  />
  <div class="tags"><ElmTag v-for="tag in tags" :text="tag.name" /></div>

  <BlogDate :created-at="createdAt" :updated-at="updatedAt" />
  <ElmHeading1 v-if="title != null" :text="title" />
</template>

<script setup lang="ts">
import { ElmBreadcrumb, ElmHeading1, ElmTag } from '@elmethis/core'

interface BlogMainProps {
  links: Array<{
    text: string
    path: string
  }>
  title?: string
  createdAt?: string
  updatedAt?: string
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
}

defineProps<BlogMainProps>()
</script>

<style scoped lang="scss">
.tags {
  display: flex;
  gap: 0.5rem;
}
</style>
