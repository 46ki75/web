<template>
  <BlogMain
    :links="[
      {
        text: 'HOME',
        path: '/'
      },
      {
        text: 'Blog',
        path: '/blog'
      },
      {
        text: 'Article',
        path: `/blog/article/${route.params.slug}`
      }
    ]"
    title="BLOG"
  />
  <article>
    <ElmJsonRenderer v-if="page.data.value != null" :json="page.data.value" />
  </article>
</template>

<script setup lang="ts">
import { ElmJsonRenderer, type ElmJsonRendererProps } from '@elmethis/core'

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
  ogp: string
}

const route = useRoute()

const page = useAsyncData<ElmJsonRendererProps['json']>(
  `/api/blog/article/${route.params.slug}`,
  async () => await $fetch(`/api/blog/article/${route.params.slug}`)
)

const meta = useAsyncData<BlogMeta>(
  `/api/blog/meta/${route.params.slug}`,
  async () => await $fetch(`/api/blog/meta/${route.params.slug}`)
)

useSeoMeta({
  title: meta.data.value?.title,
  description: meta.data.value?.description,
  ogTitle: meta.data.value?.title,
  ogDescription: meta.data.value?.description,
  ogImage: meta.data.value?.ogp,
  ogUrl: `https://www.46ki75.com/blog/article/${route.params.slug}`,
  twitterTitle: meta.data.value?.title,
  twitterDescription: meta.data.value?.description,
  twitterImage: meta.data.value?.ogp,
  twitterCard: 'summary_large_image'
})
</script>

<style scoped></style>
