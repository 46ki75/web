<template>
  <div class="container">
    <div class="inner-container">
      <CalendarDateRangeIcon class="icon" />
      <ElmInlineText :text="createdAt ?? '0000-00-00'" />
    </div>
    <div class="inner-container">
      <ArrowPathIcon class="icon" />
      <ElmInlineText :text="updatedAt ?? '0000-00-00'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElmInlineText } from '@elmethis/core'
import { ArrowPathIcon, CalendarDateRangeIcon } from '@heroicons/vue/24/outline'

defineProps<{
  createdAt?: string
  updatedAt?: string
}>()
</script>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  color: rgba(black, 0.8);
  [data-theme='dark'] & {
    color: rgba(white, 0.8);
  }
}

.inner-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
