<template>
  <div></div>
</template>

<script setup lang="ts">
const { locale } = useI18n();
const router = useRouter();

onMounted(() => {
  router.replace(locale.value === "en" ? "/" : `/${locale.value}`);
});
</script>
