<template>
  <footer class="footer">
    <div class="container">
      <p><ElmInlineText text="FOOTER" /></p>
      <hr class="hr" />
      <div class="bottom">
        <div class="left">
          <ElmInlineText
            :text="`© Ikuma Yamashita 2022-${new Date().getFullYear()} ・ Build: ${build}`"
            size="0.8rem"
          />
        </div>

        <div class="right">
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
}

.right {
  display: flex;
  gap: 1rem;
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
