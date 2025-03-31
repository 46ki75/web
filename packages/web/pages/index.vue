<script setup lang="ts">
import { ElmButton } from "@elmethis/core";

const { start, finish } = useLoadingIndicator();
</script>

<template>
  <div key="/">
    <div>
      <div>INDEX</div>
      <div>
        <NuxtLink to="/blog">Blog</NuxtLink>
      </div>

      <ElmButton block @click="start">LOADING START</ElmButton>
      <ElmButton block @click="finish">LOADING STOP</ElmButton>
    </div>
  </div>
</template>
