<template>
  <ElmHeading :level="2">
    <slot />
  </ElmHeading>
</template>

<script setup lang="ts">
import { ElmHeading } from "@elmethis/core";
</script>
