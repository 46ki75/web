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

    <div>
      <ElmHeading :level="2" :text="t('blog.index.featured-posts')" />
      <ElmParagraph>BLOG HOME PLACEHOLDER</ElmParagraph>
      <ElmHeading :level="2" :text="t('blog.index.newest-posts')" />
      <ElmParagraph>BLOG HOME PLACEHOLDER</ElmParagraph>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmHeading, ElmParagraph } from "@elmethis/core";

const { locale, t } = useI18n();
</script>
