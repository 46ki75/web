<template>
  <div :class="$style.wrapper">
    <div :class="$style.inner">
      <header>
        <h1 :class="$style.greet">Hello.</h1>
      </header>

      <ElmParagraph>
        <ElmInlineText text="My name is " />
        <ElmInlineText bold text="Ikuma Yamashita" />
        <ElmInlineText text="." />
      </ElmParagraph>

      <ElmParagraph>
        <ElmInlineText
          text="I work as a public cloud infrastructure engineer, with a focus on AWS."
        />
      </ElmParagraph>

      <ElmParagraph>
        <ElmInlineText
          text="Outside of work, I continue to enjoy programming—a passion since before my career began. I actively contribute to open source, and Rust is my favorite language."
        />
      </ElmParagraph>

      <ElmParagraph>
        <ElmInlineText
          text="In addition to system programming, I also enjoy web development. I've explored various SPA frameworks, but I particularly like Vue.js for its strong support for universal rendering."
        />
      </ElmParagraph>

      <ElmParagraph>
        <ElmInlineText
          text="In my free time, I enjoy creating digital illustrations."
        />
      </ElmParagraph>

      <ElmParagraph>
        <ElmInlineText text="I am currently based in " />
        <ElmInlineText text="Tokyo" ruby="東京" />
        <ElmInlineText text=", Japan." />
      </ElmParagraph>

      <ElmHeading :level="2" disable-fragment-identifier>Find me on</ElmHeading>

      <div :class="$style.links">
        <ElmBookmarkIcon
          name="Email"
          favicon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMiA2YzAtMS4xLS45LTItMi0ySDRjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJ6bS0yIDBsLTggNWwtOC01em0wIDEySDRWOGw4IDVsOC01eiIvPjwvc3ZnPg=="
          href="mailto:me@ikuma.cloud"
        />
        <ElmBookmarkIcon
          name="GitHub"
          favicon="https://github.githubassets.com/favicons/favicon.svg"
          href="https://github.com/46ki75"
        />
        <ElmBookmarkIcon
          name="X"
          favicon="https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png"
          href="https://x.com/46ki75"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElmParagraph,
  ElmInlineText,
  ElmHeading,
  ElmBookmarkIcon,
} from "@elmethis/core";
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  justify-content: center;
}

.inner {
  box-sizing: border-box;
  margin-block: 0.5rem;
  padding: 0 2rem 4rem;
  border-radius: 0.25rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  background-color: rgba(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }
}

.greet {
  color: #3e434b;

  &::selection {
    color: #cccfd5;
    background-color: #3e434b;
  }

  [data-theme="dark"] & {
    color: #cccfd5;

    &::selection {
      color: #3e434b;
      background-color: #cccfd5;
    }
  }
}

.links {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  user-select: none;
  opacity: 0.7;

  [data-theme="dark"] & {
    img {
      filter: invert(1);
    }
  }
}
</style>
