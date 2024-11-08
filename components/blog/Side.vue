<template>
  <nav>{{ data }}</nav>
</template>

<script setup lang="ts">
const { data } = useFetch('/api/blog/side')
</script>

<style scoped lang="scss"></style>
