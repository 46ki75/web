<template>
  <article :key="JSON.stringify(route.params.slug)">
    <ElmJsonRenderer v-if="data != null" :json="data" />
  </article>
</template>

<script setup lang="ts">
import { ElmJsonRenderer, type ElmJsonRendererProps } from '@elmethis/core'

const route = useRoute()

const { data } = useAsyncData<ElmJsonRendererProps['json']>(() =>
  $fetch(`/api/blog/article/${route.params.slug}`)
)
</script>

<style scoped></style>
