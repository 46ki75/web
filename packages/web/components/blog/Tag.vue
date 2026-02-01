<template>
  <div class="tag">
    <img v-if="iconUrl" class="icon-image" :src="iconUrl" alt="" />
    <Icon v-else icon="fa-solid:tags" class="icon" />
    <ElmInlineText :text="name" size="0.85rem" />
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText } from "@elmethis/vue";
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
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: center;
  border-radius: 0.125rem;
  transition: background-color 100ms;
  cursor: pointer;

  &:hover {
    background-color: rgb(grey, 0.1);
  }
}

.icon {
  box-sizing: border-box;
  padding: 0.125rem;
  height: 1.25rem;
  width: 1.25rem;
}

.icon-image {
  height: 1.25rem;
  width: 1.25rem;
}
</style>
