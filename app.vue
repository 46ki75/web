<template>
  <NuxtLayout name="default">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;

  transition: background-color 200ms;

  background-color: rgba(0, 0, 0, 0.05);
  [data-theme='dark'] & {
    background-color: rgba(0, 0, 0, 0.85);
  }
}
</style>
