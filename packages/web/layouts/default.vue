<template>
  <Header />
  <slot />
  <ElmPagetop />
  <Footer />
</template>

<script setup lang="ts">
import { ElmPagetop } from '@elmethis/core'
</script>
