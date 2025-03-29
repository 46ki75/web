<template>
  <div class="tag">
    <Icon icon="fa-solid:tags" :color="color" class="icon" />
    <ElmInlineText :text="label" :color="color" size="0.85rem" />
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

interface BlogtagProps {
  label: string;
  color: string;
}

defineProps<BlogtagProps>();
</script>

<style lang="scss" scoped>
.tag {
  padding: 0.5rem;
  display: inline-flex;
  gap: 0.25rem;
  justify-content: flex-start;
  align-items: center;
  border-radius: 0.125rem;
  transition: background-color 100ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(#888, 0.1);
  }
}

.icon {
  height: 0.85rem;
}
</style>
