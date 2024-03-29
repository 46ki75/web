<template>
  <footer class="footer">
    <div class="copyright">
      2022-{{ new Date().getFullYear() }} Chomolungma Shirayuki
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer {
  padding: 2rem;

  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.15);

  display: flex;
  justify-content: center;
  align-items: center;
}

.copyright {
  color: rgba(0, 0, 0, 0.6);
}
</style>
