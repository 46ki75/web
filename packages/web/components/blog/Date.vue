<template>
  <div class="date">
    <Icon icon="mdi:calendar-month" class="icon" />
    <ElmInlineText :text="createdAt.substring(0, 10)" size="0.8rem" />
    <Icon icon="mdi:calendar-refresh" class="icon" />
    <ElmInlineText :text="updatedAt.substring(0, 10)" size="0.8rem" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ElmInlineText } from "@elmethis/core";

interface BlogDateProps {
  createdAt: string;
  updatedAt: string;
}

const props = defineProps<BlogDateProps>();
</script>

<style lang="scss" scoped>
.date {
  opacity: 0.7;
  margin-block: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}

.icon {
  color: rgba(black, 0.9);
  [data-theme="dark"] & {
    color: rgba(white, 0.9);
  }
}
</style>
