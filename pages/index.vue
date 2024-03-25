<template>
  <div>aaa</div>
  <div v-if="!pending">data: {{ data }}</div>
  <div>pending: {{ pending }}</div>
  <div>error: {{ error }}</div>
</template>

<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'

const { data, pending, error } = await useAsyncData('hello', async () => {
  return $fetch('/api/hello.json')
})
</script>

<style scoped></style>
