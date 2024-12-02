<template>
  <div class="fallback">
    <ElmRectangleWave />
    <ElmDotLoadingIcon />
  </div>
</template>

<script setup lang="ts">
import { ElmDotLoadingIcon, ElmRectangleWave } from '@elmethis/core'
</script>

<style scoped lang="scss">
.fallback {
  width: 100%;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
