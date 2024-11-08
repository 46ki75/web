<template>
  <div class="body">
    <BlogMain>
      <NuxtPage />
    </BlogMain>
    <BlogSide />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.body {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}
</style>
