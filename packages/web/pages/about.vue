<template>
  <BaseContainer>
    <ElmBreadcrumb
      :links="[
        {
          text: 'Home',
          onClick: () =>
            $router.push(locale === defaultLocale ? `/` : `/${locale}`),
        },
        {
          text: 'About',
          onClick: () =>
            $router.push(
              locale === defaultLocale ? `/about` : `/${locale}/about`
            ),
        },
      ]"
    />

    <BaseDate created-at="2025-06-02" updated-at="2025-06-03" />

    <MDC v-if="md" :value="md" tag="article" />

    <ElmHeading :level="2" disable-fragment-identifier> Find me on </ElmHeading>

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
      <ElmBookmarkIcon
        name="LinkedIn"
        favicon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHBhdGggZmlsbD0iIzBhNjZjMiIgZD0iTTIxOC4xMjMgMjE4LjEyN2gtMzcuOTMxdi01OS40MDNjMC0xNC4xNjUtLjI1My0zMi40LTE5LjcyOC0zMi40Yy0xOS43NTYgMC0yMi43NzkgMTUuNDM0LTIyLjc3OSAzMS4zNjl2NjAuNDNoLTM3LjkzVjk1Ljk2N2gzNi40MTN2MTYuNjk0aC41MWEzOS45MSAzOS45MSAwIDAgMSAzNS45MjgtMTkuNzMzYzM4LjQ0NSAwIDQ1LjUzMyAyNS4yODggNDUuNTMzIDU4LjE4NnpNNTYuOTU1IDc5LjI3Yy0xMi4xNTcuMDAyLTIyLjAxNC05Ljg1Mi0yMi4wMTYtMjIuMDA5czkuODUxLTIyLjAxNCAyMi4wMDgtMjIuMDE2YzEyLjE1Ny0uMDAzIDIyLjAxNCA5Ljg1MSAyMi4wMTYgMjIuMDA4QTIyLjAxMyAyMi4wMTMgMCAwIDEgNTYuOTU1IDc5LjI3bTE4Ljk2NiAxMzguODU4SDM3Ljk1Vjk1Ljk2N2gzNy45N3pNMjM3LjAzMy4wMThIMTguODlDOC41OC0uMDk4LjEyNSA4LjE2MS0uMDAxIDE4LjQ3MXYyMTkuMDUzYy4xMjIgMTAuMzE1IDguNTc2IDE4LjU4MiAxOC44OSAxOC40NzRoMjE4LjE0NGMxMC4zMzYuMTI4IDE4LjgyMy04LjEzOSAxOC45NjYtMTguNDc0VjE4LjQ1NGMtLjE0Ny0xMC4zMy04LjYzNS0xOC41ODgtMTguOTY2LTE4LjQ1MyIvPjwvc3ZnPg=="
        href="https://www.linkedin.com/in/ikuma-yamashita-b3080a344"
      />
    </div>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElmHeading, ElmBookmarkIcon, ElmBreadcrumb } from "@elmethis/core";

const { locale, defaultLocale } = useI18n();

const { data: md } = useAsyncData(`AboutMarkdown${locale.value}`, async () => {
  const { readFile } = await import("node:fs/promises");
  const md = await readFile(`pages/about.${locale.value}.md`, "utf-8");
  return md;
});
</script>

<style module lang="scss">
.greet {
  margin-block: 2rem;
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
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  user-select: none;
  opacity: 0.8;

  [data-theme="dark"] & {
    img {
      filter: invert(1);
    }
  }
}
</style>
