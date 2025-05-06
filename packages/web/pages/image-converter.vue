<template>
  <div class="wrapper">
    <ImageConverter
      v-if="imageConverterFunctionMap"
      :image-converter-function-map="imageConverterFunctionMap"
    />
  </div>
</template>

<script setup lang="ts">
import { ImageConverter, useImageConverter } from "vue-image-converter";

import * as Comlink from "comlink";

const imageConverterFunctionMap = ref<
  Parameters<typeof useImageConverter>[0] | null
>(null);

onMounted(() => {
  const worker = new Worker(
    new URL("../ImageConverter/worker.ts", import.meta.url),
    {
      type: "module",
    }
  );

  imageConverterFunctionMap.value = Comlink.wrap<{
    init(): Promise<void>;
    png({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
    jpeg({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
    bmp({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
    webp({ bytes }: { bytes: Uint8Array }): Promise<Uint8Array>;
  }>(worker);
});
</script>

<style lang="scss">
.wrapper {
  box-sizing: border-box;
  padding: 1rem;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
