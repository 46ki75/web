<template>
  <div class="center">
    <main class="main">
      <slot />
    </main>
    <aside class="side"><BlogSide /></aside>
  </div>
</template>

<style lang="scss" scoped>
.center {
  margin-block: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0.5rem;
}

.main {
  box-sizing: border-box;
  padding: 0.5rem;
  flex-grow: 2;
  max-width: 800px;
  box-shadow: 0 0 0.125rem rgba(black, 0.25);
  background-color: rgba(white, 0.3);
  [data-theme="dark"] & {
    background-color: rgba(black, 0.1);
  }
}

.side {
  flex-grow: 1;
  max-width: 420px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}
</style>
