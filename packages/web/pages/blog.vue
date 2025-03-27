<template>
  <div>
    <NuxtLayout name="blog">
      <NuxtPage :transition="{ mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 150ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
