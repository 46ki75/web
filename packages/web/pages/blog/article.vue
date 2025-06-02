<template>
  <div>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </div>
</template>

<style lang="scss" scoped>
.v-enter-to,
.v-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 200ms, transform 200ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
