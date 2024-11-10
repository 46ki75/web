<template>
  <footer class="footer">
    <div>
      <ElmInlineText
        :text="`© 2022 - ${new Date().getFullYear()} Chonolungma Shirayuki`"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ElmInlineText } from '@elmethis/core'
</script>

<style scoped lang="scss">
.footer {
  margin-top: 10rem;
  width: 100%;
  height: 16rem;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(white, 0.5);
  box-shadow: 0 0 0.25rem rgba(black, 0.1);

  [data-theme='dark'] & {
    background-color: rgba(black, 0.5);
    box-shadow: 0 0 0.25rem rgba(black, 0.2);
  }
}
</style>
