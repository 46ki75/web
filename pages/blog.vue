<template>
  <NuxtLayout name="default">
    <NuxtLayout name="blog-main">
      <BlogMain
        :title="data != null ? data.title : ''"
        :created-at="data != null ? data.createdAt : '????-??-??'"
        :updated-at="data != null ? data.updatedAt : '????-??-??'"
        :links="links"
        :image="src"
        ><NuxtPage
      /></BlogMain>
    </NuxtLayout>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Blog } from '~/models/frontend'
import { useRoute } from 'vue-router'

const route = useRoute()

// # -------------------------------------------------- #
//
// API ENDPOINT
//
// # -------------------------------------------------- #
const apiEndpoint = computed(() => {
  const routeArray = route.path.split('/')
  if (
    routeArray.length === 2 &&
    routeArray[0] === '' &&
    routeArray[1] === 'blog'
  ) {
    return `/api/v1/blog/home/meta.json`
  }

  return `/api/v1/blog/${[...routeArray].pop()}/meta.json`
})

const { data } = await useAsyncData<Blog>(
  apiEndpoint.value,
  () => $fetch(apiEndpoint.value),
  { watch: [route] }
)

// # -------------------------------------------------- #
//
// LiNKS (for Breadcrumb)
//
// # -------------------------------------------------- #
const links = computed<Array<{ label: string; href: string }>>(() => {
  const routeArray = route.path.split('/')
  if (
    routeArray.length === 4 &&
    routeArray[0] === '' &&
    routeArray[1] === 'blog' &&
    routeArray[2] === 'article'
  ) {
    return [
      { label: 'ホーム', href: '/' },
      { label: 'ブログ', href: '/blog' },
      { label: '記事', href: route.path }
    ]
  }

  return [
    { label: 'ホーム', href: '/' },
    { label: 'ブログ', href: '/blog' }
  ]
})

// # -------------------------------------------------- #
//
// IMAGE
//
// # -------------------------------------------------- #
const src = computed(() => {
  const routeArray = route.path.split('/')
  if (
    routeArray.length === 4 &&
    routeArray[0] === '' &&
    routeArray[1] === 'blog' &&
    routeArray[2] === 'article'
  ) {
    return `/api/v1/blog/${[...routeArray].pop()}/ogp.webp`
  }

  return '/images/blog/blog.webp'
})
</script>
