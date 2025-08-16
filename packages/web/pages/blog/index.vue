<template>
  <div key="/blog">
    <BlogMeta
      key="/blog"
      title="Blog Top"
      created-at="2022-10-01"
      updated-at="2025-03-26"
      :links="[
        { text: 'Home', href: '/' },
        { text: 'Blog', href: '/blog' },
      ]"
      :language="locale"
    />

    <div key="/blog">
      <div>BLOG HOME PLACEHOLDER</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n();
</script>
