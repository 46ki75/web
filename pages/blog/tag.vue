<template>
  <BlogMain
    title="タグ検索"
    :created-at="new Date().toISOString()"
    :updated-at="new Date().toISOString()"
    :links="[
      { label: 'ホーム', href: '/' },
      { label: 'ブログ', href: '/blog' },
      { label: 'タグ検索', href: '/blog/tag' }
    ]"
    image="/images/blog/blog.webp"
  >
    <div class="tag-container">
      <BlogTag
        v-for="originalTag in originalTags"
        :label="originalTag.name"
        :color="originalTag.color"
        @click="
          () => {
            if (
              selectedTags.filter(
                (selectedTag: Select) => selectedTag.name === originalTag.name
              ).length === 0
            ) {
              selectedTags.push(originalTag)
            }
          }
        "
      />
    </div>
    <h2>selected</h2>
    <div class="tag-container">
      <BlogTag
        v-for="tag in selectedTags"
        :label="tag.name"
        :color="tag.color"
        @click="
          () => {
            selectedTags = selectedTags.filter(
              (selectedTag: Select) => selectedTag.name !== tag.name
            )
          }
        "
      />
    </div>
  </BlogMain>
  <h2>結果</h2>

  <div>
    <div v-if="isPending">LOADING</div>
    <nav v-else-if="!isPending" v-for="blog in filteredBlogs">
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
import { useQuery } from '@tanstack/vue-query'
import type { Blog, Select } from '../../models/frontend'
import { ref, watch } from 'vue'

const selectedTags = ref<Select[]>([])
const filteredBlogs = ref<Blog[]>([])

const { data: originalTags } = useQuery<Select[]>({
  queryKey: ['/api/v1/blog/list/tags.json'],
  queryFn: async () => await (await fetch('/api/v1/blog/list/tags.json')).json()
})

const { isPending, data: originalBlogs } = useQuery<Blog[]>({
  queryKey: ['/api/v1/blog/list/meta.json'],
  queryFn: async () => await (await fetch('/api/v1/blog/list/meta.json')).json()
})

watch(
  selectedTags,
  (newSelectedTags) => {
    if (newSelectedTags.length > 0 && originalBlogs.value) {
      filteredBlogs.value = originalBlogs.value.filter((blog) =>
        newSelectedTags.every((selectedTag) =>
          blog.tags.map((tag) => tag.name).includes(selectedTag.name)
        )
      )
    } else {
      filteredBlogs.value = originalBlogs.value ? [...originalBlogs.value] : []
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
.tag-container {
  display: flex;
  gap: 0.5rem;
}
</style>
