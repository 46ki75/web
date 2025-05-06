<template>
  <div class="wrapper">
    <div class="inner">
      <ImageConverter
        v-if="imageConverterFunctionMap"
        :image-converter-function-map="imageConverterFunctionMap"
      />
    </div>
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

<style scoped lang="scss">
.wrapper {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.inner {
  width: 100%;
  max-width: 1200px;
}
</style>
