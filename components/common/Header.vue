<template>
  <header
    ref="el"
    :style="{
      background: scrollTop < 48 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.3)',
      color: scrollTop > 48 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)'
    }"
  >
    <NuxtLink to="/">HOME</NuxtLink>{{ scrollTop }}
  </header>
</template>

<script setup lang="ts">
const scrollTop = ref(0)

const handleScroll = () => {
  scrollTop.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
header {
  position: sticky;
  z-index: 50;
  top: 0;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  height: 3rem;
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.3);

  transition: all 0.3s;
  backdrop-filter: blur(2px);

  a {
    all: unset;
    cursor: pointer;
  }
}
</style>
