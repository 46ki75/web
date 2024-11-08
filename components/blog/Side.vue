<template>
  <nav>
    <div class="side">
      <ElmBookmark
        v-for="side in data"
        :title="side.title"
        :description="side.description"
        :createdAt="side.createdAt"
        :updatedAt="side.updatedAt"
        :image="`/api/blog/image/${side.slug}`"
        :url="`/blog/${side.slug}`"
        :is-horizontal="false"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ElmBookmark } from '@elmethis/core'

interface BlogMeta {
  slug: number
  title: string
  description: string
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  createdAt: string
  updatedAt: string
}

const { data } = useFetch<BlogMeta[]>('/api/blog/side')
</script>

<style scoped lang="scss">
.side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 420px;
}
</style>
