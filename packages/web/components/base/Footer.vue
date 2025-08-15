<template>
  <footer class="footer">
    <div class="container">
      <div class="sitelinks">
        <div style="margin-bottom: 0.5em">
          <ElmInlineText text="SITE" size="1em" bold />
        </div>

        <NuxtLinkLocale class="sitelink" to="/about">
          <Icon icon="mdi:link-variant" size="16" color="#6987b8" />
          <div>About</div>
        </NuxtLinkLocale>

        <NuxtLinkLocale class="sitelink" to="/privacy">
          <Icon icon="mdi:link-variant" size="16" color="#6987b8" />
          <div>Privacy Policy</div>
        </NuxtLinkLocale>

        <NuxtLinkLocale class="sitelink" to="/blog">
          <Icon icon="mdi:link-variant" size="16" color="#6987b8" />
          <div>Blogs</div>
        </NuxtLinkLocale>

        <NuxtLinkLocale class="sitelink" to="/talks">
          <Icon icon="mdi:link-variant" size="16" color="#6987b8" />
          <div>Talks</div>
        </NuxtLinkLocale>
      </div>

      <hr class="hr" />
      <div class="bottom">
        <div class="left">
          <NuxtLinkLocale to="/">
            <img class="favicon" src="/brand/favicon.svg" alt="Favicon" />
          </NuxtLinkLocale>

          <div class="left-inner">
            <Icon icon="mdi:copyright" class="icon-bottom" height="12" />
            <ElmInlineText
              :text="`Ikuma Yamashita 2022 - ${new Date().getFullYear()}`"
              size="0.8rem"
            />
          </div>
          <div class="left-inner">
            <Icon icon="mdi:cube-scan" class="icon-bottom" height="12" />
            <ElmInlineText :text="`${build}`" size="0.8rem" />
          </div>
        </div>

        <div class="right">
          <a ref="noopener noreferrer" href="/sitemap.xml" target="_blank">
            <Icon class="icon" icon="mdi:sitemap" height="32px" />
          </a>

          <a
            ref="noopener noreferrer"
            href="https://github.com/46ki75/web"
            target="_blank"
          >
            <Icon class="icon" icon="mdi:github" height="32px" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";
import { version } from "../../package.json";

const { data: build } = useAsyncData("BuildDate", async () => {
  const dateBuildMeta = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `v${version}+${dateBuildMeta}`;
});
</script>

<style lang="scss" scoped>
.footer {
  margin-block-start: 4rem;
  width: 100%;
  height: 24rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 0.125rem rgba(black, 0.3);
  transition: background-color 200ms;
  background-color: rgba(white, 0.4);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.2);
  }
}

.container {
  width: 80%;
}

.sitelinks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  justify-content: flex-start;
  align-items: flex-start;
}

.sitelink {
  all: unset;
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 0.9em;
  cursor: pointer;
  transition: opacity 150ms;
  color: #494f59;

  &::selection {
    color: #bec2ca;
    background-color: #494f59;
  }

  [data-theme="dark"] & {
    color: #bec2ca;

    &::selection {
      color: #494f59;
      background-color: #bec2ca;
    }
  }

  &:hover {
    opacity: 0.5;
  }
}

.hr {
  margin-block: 1.5rem;
  width: 100%;
  border-width: 1px;
  border-color: rgba(black, 0.2);

  [data-theme="dark"] & {
    border-color: rgba(white, 0.3);
  }
}

.bottom {
  display: flex;
  justify-content: space-between;
}

.left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.left-inner {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.25rem;
}

.right {
  display: flex;
  gap: 1rem;
}

.icon-bottom {
  color: #a4863e;
}

.favicon {
  height: 1.5rem;
  width: 1.5rem;
  transition: opacity 100ms;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.5;
  }
}

.icon {
  transition: opacity 200ms;
  cursor: pointer;
  color: rgba(black, 0.7);

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }

  &:hover {
    opacity: 0.6;
  }
}
</style>
