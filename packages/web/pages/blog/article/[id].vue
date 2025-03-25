<template>
  <div><ElmInlineText :text="`ID: ${$route.params.id}`" /></div>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/core";
</script>
