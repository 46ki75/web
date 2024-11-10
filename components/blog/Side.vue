<template>
  <nav>
    <div class="side">
      <template v-for="side in data">
        <NuxtLink :to="`/blog/article/${side.slug}`" :style="{ all: 'unset' }">
          <ElmBookmark
            :title="side.title"
            :description="side.description"
            :createdAt="side.createdAt.substring(0, 10)"
            :updatedAt="side.updatedAt.substring(0, 10)"
            :image="side.ogp"
            :is-horizontal="false"
            :onClick="() => $router.push(`/blog/article/${side.slug}`)"
          />
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ElmBookmark } from '@elmethis/core'
import { z } from 'zod'

const blogMetaSchema = z.object({
  slug: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string()
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  ogp: z.string()
})

export type BlogMeta = z.infer<typeof blogMetaSchema>

const { data } = useAsyncData(async () => {
  const response = await $fetch<unknown[]>('/api/blog/side')
  const result = response.map((meta) => blogMetaSchema.parse(meta))
  return result
})
</script>

<style scoped lang="scss">
.side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 420px;
}
</style>
