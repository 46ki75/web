<template>
  <ElmBreadcrumb
    :links="
      links.map((link) => ({
        text: link.text,
        onClick: () => $router.push(link.path)
      }))
    "
  />
  <BlogDate :created-at="createdAt" :updated-at="updatedAt" />
  <ElmHeading1 v-if="title != null" :text="title" />
</template>

<script setup lang="ts">
import { ElmBreadcrumb, ElmHeading1 } from '@elmethis/core'

interface BlogMainProps {
  links: Array<{
    text: string
    path: string
  }>
  title?: string
  createdAt?: string
  updatedAt?: string
}

defineProps<BlogMainProps>()
</script>
