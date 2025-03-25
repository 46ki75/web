<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;

  transition: background-color 200ms;

  background-color: #f2f2f2;

  [data-theme="dark"] & {
    background-color: #262626;
  }
}
</style>
