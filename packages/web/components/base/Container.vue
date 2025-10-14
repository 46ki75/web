<template>
  <div :class="$style.wrapper">
    <div :class="$style.inner">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style module lang="scss">
.wrapper {
  display: flex;
  justify-content: center;
}

.inner {
  box-sizing: border-box;
  margin: 0.5rem 0.25rem;
  padding: 2rem;
  border-radius: 0.25rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 0 0.125rem rgb(black, 0.25);
  background-color: rgb(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgb(black, 0.1);
  }
}
</style>
