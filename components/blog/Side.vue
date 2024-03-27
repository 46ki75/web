<template>
  <div class="side">
    <div v-if="pending">LOADING</div>
    <nav v-else-if="!pending" v-for="blog in data">
      <BlogCard
        :title="blog.title"
        :description="blog.description"
        :tags="blog.tags"
        :image="`/api/v1/blog/${blog.slug}/ogp.webp`"
        :href="`/blog/article/${blog.slug}`"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { type Blog } from '~/models/frontend'

const { data, pending } = await useFetch<Blog[]>('/api/v1/blog/list/meta.json')
</script>

<style scoped lang="scss">
.side {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
