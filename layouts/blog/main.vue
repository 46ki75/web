<template>
  <div
    class="parallax"
    :style="{
      backgroundPosition: `50% ${bgPosition * 0.7}px`
    }"
  >
    <div
      class="body"
      :style="{
        backgroundPosition: `50% ${bgPosition * 0.5}px`
      }"
    >
      <div class="body-container">
        <main class="main">
          <slot />
        </main>
        <div class="side">
          <BlogSide />
        </div>
      </div>
    </div>
  </div>
  <Pagetop />
</template>

<script setup lang="ts">
import { Pagetop } from 'elmethis'

const bgPosition = ref(0)

const handleScroll = () => {
  bgPosition.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.parallax {
  width: 100%;

  background-image: url('/images/blog/bg1.webp');
  background-repeat: repeat;
  transition: all 0s;

  .body {
    width: 100%;
    background-image: url('/images/blog/bg2.webp');
    background-repeat: repeat;
    transition: all 0s;

    @media (min-width: 1024px) {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .body-container {
      width: 100%;
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
        width: 100%;
        flex: 6.5;
        box-shadow: 0 0 0.125rem rgba(0, 0, 0, 0.3);
        background: rgba(255, 255, 255, 0.6);
        padding: 0.25rem;

        @media (min-width: 1024px) {
          padding: 0.5rem;
        }
      }

      .side {
        width: 100%;
        box-sizing: border-box;
        flex: 3.5;
      }
    }
  }
}
</style>
