<template>
  <BlogMain
    title="blog home"
    :created-at="new Date().toISOString()"
    :updated-at="new Date().toISOString()"
    :links="[
      { label: 'ホーム', href: '/' },
      { label: 'ブログ', href: '/blog' }
    ]"
    image="/images/blog/blog.webp"
    ><NuxtLink to="/blog/tag">タグ検索</NuxtLink></BlogMain
  >
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
