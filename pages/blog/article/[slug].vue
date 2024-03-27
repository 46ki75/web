<template>
  <article>
    <BlogMain
      :title="meta != null ? meta.title : ''"
      :created-at="meta != null ? meta.createdAt : '????-??-??'"
      :updated-at="meta != null ? meta.updatedAt : '????-??-??'"
      :links="[
        { label: 'ホーム', href: '/' },
        { label: 'ブログ', href: '/blog' },
        { label: '記事', href: route.path }
      ]"
      :image="`/api/v1/blog/${route.path.split('/').pop()}/ogp.webp`"
      ><NotionHTML :domjson="body ?? []"
    /></BlogMain>
  </article>
</template>

<script setup lang="ts">
import { NotionHTML } from 'elmethis'
import type { DOMJSON } from 'notion-markup-utils/dist/block/DOMJSON'
import type { Blog } from '~/models/frontend'

const route = useRoute()

const { data: meta } = await useAsyncData<Blog>(
  `/api/v1/blog/${route.path.split('/').pop()}/meta.json`,
  () => $fetch(`/api/v1/blog/${route.path.split('/').pop()}/meta.json`),
  { watch: [route] }
)

const { data: body } = await useAsyncData<DOMJSON[]>(
  `/api/v1/blog/${route.path.split('/').pop()}/body.json`,
  () => $fetch(`/api/v1/blog/${route.path.split('/').pop()}/body.json`),
  { watch: [route] }
)
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
