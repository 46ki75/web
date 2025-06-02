<template>
  <div :class="$style.wrapper">
    <div :class="$style.inner">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// export interface ContainerProps {}

// withDefaults(defineProps<ContainerProps>(), {});
</script>

<style module lang="scss">
.wrapper {
  display: flex;
  justify-content: center;
}

.inner {
  box-sizing: border-box;
  margin: 0.5rem 0.25rem;
  padding: 2rem 4rem;
  border-radius: 0.25rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  background-color: rgba(white, 0.3);

  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }
}
</style>
