<template>
  <div>aaa</div>
  <div>data: {{ data }}</div>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'

const { data, pending } = await useFetch('/api/blog/list.json')
</script>

<style scoped></style>
