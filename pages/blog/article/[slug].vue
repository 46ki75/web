<template>
  <article>
    <BlogMain
      :title="!pending && meta != null ? meta.title : ''"
      :created-at="!pending && meta != null ? meta.createdAt : '????-??-??'"
      :updated-at="!pending && meta != null ? meta.updatedAt : '????-??-??'"
      :links="[
        { label: 'ホーム', href: '/' },
        { label: 'ブログ', href: '/blog' },
        { label: '記事', href: route.path }
      ]"
      :image="`/api/v1/blog/${route.path.split('/').pop()}/ogp.webp`"
      :tags="meta?.tags"
    >
      <NotionHTML :domjson="body ?? []" />
    </BlogMain>
  </article>
</template>

<script setup lang="ts">
import { NotionHTML } from 'elmethis'
import type { DOMJSON } from 'notion-markup-utils/dist/block/DOMJSON'
import type { Blog } from '~/models/frontend'

import { useQuery } from '@tanstack/vue-query'

const route = useRoute()

const slug = computed(
  () => route.path.split('/')[route.path.split('/').length - 1]
)

const { data: meta, pending } = useAsyncData<Blog>(
  `/api/v1/blog/${slug.value}/meta.json`,
  async () => await $fetch(`/api/v1/blog/${slug.value}/meta.json`),
  { watch: [route] }
)

const { data: body } = useAsyncData<DOMJSON[]>(
  `/api/v1/blog/${slug.value}/body.json`,
  async () => await $fetch(`/api/v1/blog/${slug.value}/body.json`),
  { watch: [route] }
)

useSeoMeta({
  title: () => meta.value?.title ?? '',
  ogTitle: () => meta.value?.title,
  description: () => meta.value?.description,
  ogImage: () => `/api/v1/blog/${slug.value}/ogp.webp`,
  author: 'Chomolungma Shirayuki',
  articlePublishedTime: () =>
    new Date(String(meta.value?.createdAt)).toISOString(),
  articleModifiedTime: () =>
    new Date(String(meta.value?.updatedAt)).toISOString()
})
</script>

<style scoped lang="scss">
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

article {
  animation: fade 0.4s both;
}
</style>
