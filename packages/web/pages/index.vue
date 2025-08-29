<script setup lang="ts">
import { ElmTypingAnimation } from "@elmethis/core";

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
</script>

<template>
  <div key="/">
    <div :class="$style.container">
      <div style="padding: 1rem; text-align: center">
        <ElmTypingAnimation :texts="texts" :interval="3000" font-size="2rem" />
      </div>
    </div>

    <div :class="$style.container">
      <nav :class="$style['card-container']">
        <home-card
          title="About me"
          description="Software developer based in Japan. Learn more about me."
          to="/about"
          iconify-icon="fluent-color:patient-32"
        />

        <home-card
          title="Blog"
          description="Insights, tutorials, and stories from real-world software projects."
          to="/blog"
          iconify-icon="fluent-color:notebook-32"
        />

        <home-card
          title="WASM Image Converter"
          description="Convert images locally in your browser using WebAssembly—no server upload required, fast and private."
          to="/image-converter"
          src="/image/image-converter.png"
        />

        <home-card
          title="Talks"
          description="Browse my lightning talks and presentations from developer events."
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
  min-height: calc(50vh - #{variables.$header-height});
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: stretch;
  gap: 0.75rem;
}
</style>
