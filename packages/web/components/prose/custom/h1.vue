<template>
  <h1 :class="$style.h1">
    <slot />
  </h1>
</template>

<style module lang="scss">
.h1 {
  font-size: 2rem;
  margin-block: 2rem;
  color: #3e434b;

  &::selection {
    color: #cccfd5;
    background-color: #3e434b;
  }

  [data-theme="dark"] & {
    color: #cccfd5;

    &::selection {
      color: #3e434b;
      background-color: #cccfd5;
    }
  }
}
</style>
