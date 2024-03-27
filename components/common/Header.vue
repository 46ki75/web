<template>
  <header><NuxtLink to="/">HOME</NuxtLink></header>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
header {
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  height: 3rem;
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.3);

  a {
    all: unset;
    cursor: pointer;
  }
}
</style>
