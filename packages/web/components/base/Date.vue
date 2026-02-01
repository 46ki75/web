<template>
  <div class="date">
    <div class="inner">
      <Icon icon="mdi:calendar-month" class="icon" />
      <ElmInlineText :text="createdAt.substring(0, 10)" size="0.8rem" />
    </div>

    <div class="inner">
      <Icon icon="mdi:calendar-refresh" class="icon" />
      <ElmInlineText :text="updatedAt.substring(0, 10)" size="0.8rem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ElmInlineText } from "@elmethis/vue";

interface BaseDateProps {
  createdAt: string;
  updatedAt: string;
}

defineProps<BaseDateProps>();
</script>

<style lang="scss" scoped>
.date {
  opacity: 0.7;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.inner {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

.icon {
  color: #7f6830;

  [data-theme="dark"] & {
    color: #b69545;
  }
}
</style>
