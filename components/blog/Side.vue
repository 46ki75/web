<template>
  <div class="side">
    <div v-if="pending">LOADING</div>
    <div v-else-if="!pending" v-for="blog in data">
      <BlogCard
        :title="blog.title"
        :description="blog.description"
        :tags="blog.tags"
        :image="`/api/blog/${blog.slug}/ogp.webp`"
        :href="`/blog/article/${blog.slug}`"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { type Blog } from '~/models/frontend'

const { data, pending } = await useFetch<Blog[]>('/api/blog/list.json')
</script>

<style scoped lang="scss">
.side {
  margin: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
