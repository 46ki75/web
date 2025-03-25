<template>
  <div class="center">
    <div class="main">
      <slot />
    </div>
    <nav><BlogSide /></nav>
  </div>
</template>

<style lang="scss" scoped>
.center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0.5rem;
}

.main {
  background-color: rgba(grey, 0.5);
}

.side {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}
</style>
