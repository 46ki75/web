<template>
  <div class="side">
    <div v-if="isPending">LOADING</div>
    <nav v-else-if="!isPending" v-for="(blog, index) in data">
      <BlogCard
        :title="blog.title"
        :description="blog.description"
        :tags="blog.tags"
        :image="`/api/v1/blog/${blog.slug}/ogp.webp`"
        :href="`/blog/article/${blog.slug}`"
        :created-at="blog.createdAt"
        :updated-at="blog.updatedAt"
        :animation-delay="index * 0.3"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { type Blog } from '~/models/frontend'
import { useQuery } from '@tanstack/vue-query'

const { isPending, data } = useQuery<Blog[]>({
  queryKey: ['/api/v1/blog/list/meta.json'],
  queryFn: async () => await $fetch('/api/v1/blog/list/meta.json')
})
</script>

<style scoped lang="scss">
.side {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
