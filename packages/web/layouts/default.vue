<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
    <Head>
      <template v-for="link in head.link" :key="link.key">
        <Link
          :id="link.key"
          :rel="link.rel"
          :href="link.href"
          :hreflang="link.hreflang"
        />
      </template>
      <template v-for="meta in head.meta" :key="meta.key">
        <Meta
          :id="meta.key"
          :property="meta.property"
          :content="meta.content"
        />
      </template>
    </Head>
    <Body>
      <BaseHeader />

      <div class="bg">
        <slot />
        <ClientOnly>
          <ElmParallax
            image-url1="/static/image/bg-crimson.webp"
            image-url2="/static/image/bg-amber.webp"
          />
        </ClientOnly>
      </div>

      <BaseFooter />
    </Body>
  </Html>
</template>

<script setup lang="ts">
import { ElmParallax } from "@elmethis/vue";

const head = useLocaleHead();
</script>

<style scoped lang="scss">
.bg {
  background-image: radial-gradient(
    circle,
    rgba(#25282e, 0.03) 10%,
    transparent 10%
  );
  background-size: 20px 20px;

  [data-theme="dark"] & {
    background-image: radial-gradient(
      circle,
      rgba(#bec2ca, 0.03) 10%,
      transparent 10%
    );
  }
}
</style>
