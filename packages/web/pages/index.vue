<script setup lang="ts">
import { ElmButton, ElmKatex } from "@elmethis/core";

const { start, finish } = useLoadingIndicator();
</script>

<template>
  <div key="/">
    <div>
      <div>INDEX</div>
      <ElmKatex expression="x = \frac{ -b \pm \sqrt{b^2 - 4ac} }{2a}" block />
      <div>
        <NuxtLinkLocale to="/blog">Blog</NuxtLinkLocale>
      </div>

      <div>
        <NuxtLinkLocale to="/image-converter">Image Converter</NuxtLinkLocale>
      </div>

      <ElmButton block @click="start">LOADING START</ElmButton>
      <ElmButton block @click="finish">LOADING STOP</ElmButton>
    </div>
  </div>
</template>
