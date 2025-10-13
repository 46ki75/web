<template>
  <div class="tag">
    <img v-if="iconUrl" class="icon-image" :src="iconUrl" alt="" />
    <Icon v-else icon="fa-solid:tags" class="icon" />
    <ElmInlineText :text="name" size="0.85rem" />
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/core";
import { Icon } from "@iconify/vue";

interface BlogtagProps {
  id: string;
  name: string;
  iconUrl?: string | null;
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
    background-color: rgba(grey, 0.1);
  }
}

.icon {
  height: 1rem;
}

.icon-image {
  height: 0.85rem;
}
</style>
