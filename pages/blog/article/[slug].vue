<template>
  <article>
    <NotionHTML :domjson="data ?? []" />
  </article>
</template>

<script setup lang="ts">
import { NotionHTML } from 'elmethis'
import type { DOMJSON } from 'notion-markup-utils/dist/block/DOMJSON'

const route = useRoute()
const { data } = await useAsyncData<DOMJSON[]>(
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
