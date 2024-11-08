<template>
  <div>
    <Header />
    <slot />
    <ElmPagetop />
  </div>
</template>

<script setup lang="ts">
import { ElmPagetop } from '@elmethis/core'
</script>
