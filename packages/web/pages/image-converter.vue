<template>
  <div :class="$style.wrapper">
    <ImageConverter :image-converter-function-map="imageConverterFunctionMap" />
  </div>
</template>

<script setup lang="ts">
import { ImageConverter } from "vue-image-converter";
import { imageConverterFunctionMap } from "../ImageConverter/imageConverterFunctionMap";
</script>

<style module lang="scss">
.wrapper {
  box-sizing: border-box;
  padding: 1rem;
  max-width: 1200px;
}
</style>
