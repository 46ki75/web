<template>
  <div :class="$style.edit">
    <a
      :href="url.replace('https://', 'notion://')"
      :class="$style['edit-inner']"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon :class="$style.notion" icon="simple-icons:notion" size="24px" />
      <ElmInlineText text="Edit this page on Notion" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/vue";
import { Icon } from "@iconify/vue";

export interface BlogEditOnNotionProps {
  url: string;
}

withDefaults(defineProps<BlogEditOnNotionProps>(), {});
</script>

<style module lang="scss">
.edit {
  margin-block: 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.edit-inner {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 150ms;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  &:hover {
    background-color: rgba(#868e9c, 0.15);
  }
}

.notion {
  opacity: 0.8;
  color: #2a2e35;

  [data-theme="dark"] & {
    filter: invert(1);
  }
}
</style>
