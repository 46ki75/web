<template>
  <div>aaa</div>
  <div>{{ data }}</div>
</template>

<script setup lang="ts">
const data = ref({})
onMounted(async () => {
  const res = await fetch('/api/hello.json')
  const body = await res.json()
  data.value = body
})
</script>

<style scoped></style>
