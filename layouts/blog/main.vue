<template>
  <div class="body">
    <div class="body-container">
      <main class="main">
        <slot />
      </main>
      <div class="side">
        <BlogSide />
      </div>
    </div>
  </div>
  <Pagetop />
</template>

<script setup lang="ts">
import { Pagetop } from 'elmethis'
</script>

<style scoped lang="scss">
.body {
  width: 100%;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .body-container {
    margin: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    @media (min-width: 1024px) {
      max-width: 1380px;

      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      gap: 1rem;
    }

    .main {
      flex: 6.5;
      box-shadow: 0 0 0.125rem rgba(0, 0, 0, 0.3);

      padding: 0.25rem;

      @media (min-width: 1024px) {
        padding: 0.5rem;
      }
    }

    .side {
      box-sizing: border-box;
      flex: 3.5;
    }
  }
}
</style>
