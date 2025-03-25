<template>
  <div class="center">
    <main class="main">
      <slot />
    </main>
    <aside><BlogSide /></aside>
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
  max-width: 800px;
  background-color: rgba(grey, 0.5);
}

.side {
  max-width: 420px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}
</style>
