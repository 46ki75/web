<template>
  <div>
    <div class="author">
      <div class="image">
        <ElmImage
          src="/static/image/profile.webp"
          alt="Portrait of the Author"
        />
      </div>

      <div class="text-container">
        <div class="author-name">
          <ElmInlineText :text="`${t('profile.name')}`" bold />
        </div>

        <div class="author-description">
          <ElmInlineText size="0.9rem" :text="`${t('profile.bio')}`" />
        </div>

        <div class="link-icons">
          <NuxtLinkLocale to="/about" class="to-about">
            <Icon icon="stash:chevron-double-right" height="1.25rem" />
            <span>{{ t("profile.detail") }}</span>
          </NuxtLinkLocale>
          <a
            ref="noopener noreferrer"
            href="https://github.com/46ki75"
            target="_blank"
          >
            <Icon class="icon" icon="mdi:github" height="32px" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElmImage, ElmInlineText } from "@elmethis/vue";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.author {
  margin-block: 1.5rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: flex-start;
  align-items: center;
  border-radius: 0.25rem;
  padding: 0.5rem;
  box-shadow: 0 0 0.125rem rgb(black, 0.25);
  background-color: rgb(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgb(black, 0.3);
  }
}

.image {
  display: block;
  width: 128px;
  height: 128px;
  border-radius: 0.25rem;
  overflow: hidden;
  opacity: 0.9;
}

.text-container {
  width: calc(100% - 128px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
}

.author-name {
  line-height: 1.5rem;
  opacity: 0.9;
}

.author-description {
  line-height: 1.25rem;
  opacity: 0.7;
}

.link-icons {
  display: flex;
  gap: 0.5rem;
  height: 32px;
  justify-content: flex-end;
  align-items: center;
}

.to-about {
  all: unset;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #6987b8;
  transition: background-color 100ms;

  &:hover {
    background-color: rgba(#6987b8, 0.1);
  }

  &:active {
    background-color: rgba(#59b57c, 0.1);
  }
}

.icon {
  transition: opacity 200ms;
  cursor: pointer;
  color: rgb(black, 0.7);

  [data-theme="dark"] & {
    color: rgb(white, 0.7);
  }

  &:hover {
    opacity: 0.6;
  }
}
</style>
