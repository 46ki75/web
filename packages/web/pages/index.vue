<script setup lang="ts">
import { ElmHeading, ElmTypingAnimation } from "@elmethis/vue";

const texts: string[] = [
  "Hi, there.",
  "Building software and sharing insights.",
  "Projects and posts for curious minds.",
  "Lessons learned from real development.",
  "Writing about code and architecture.",
  "Tips and guides for modern web apps.",
  "Notes on Rust, TypeScript, and AWS.",
  "From idea to deployment, step by step.",
  "Talks, demos, and practical examples.",
  "Welcome to my portfolio and blog.",
];

const { t } = useI18n();
</script>

<template>
  <div>
    <div :class="$style.container">
      <div style="padding: 1rem; text-align: center">
        <ElmTypingAnimation :texts="texts" :interval="3000" font-size="2rem" />
      </div>
    </div>

    <div :class="$style.container">
      <ElmHeading
        text="Explore"
        disable-fragment-identifier
        style="text-align: center; width: 16rem"
      />
      <nav :class="$style['card-container']">
        <home-card
          title="About me"
          :description="t('profile.navigation.about')"
          to="/about"
          iconify-icon="fluent-color:patient-32"
        />

        <home-card
          title="Blog"
          :description="t('profile.navigation.blog')"
          to="/blog"
          iconify-icon="fluent-color:notebook-32"
        />

        <home-card
          title="WASM Image Converter"
          :description="t('profile.navigation.image-converter')"
          to="/image-converter"
          src="/image/image-converter.png"
        />

        <home-card
          title="Talks"
          :description="t('profile.navigation.talks')"
          to="/talks"
          iconify-icon="fluent-color:person-feedback-32"
        />
      </nav>
    </div>
  </div>
</template>

<style module lang="scss">
@use "../styles/variables";

.container {
  width: 100%;
  min-height: calc(50vh - #{variables.$header-height});
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.card-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: stretch;
  gap: 0.75rem;
}
</style>
