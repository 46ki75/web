<template>
  <BaseContainer>
    <ElmBreadcrumb
      :links="[
        {
          text: 'Home',
          onClick: () =>
            $router.push(locale === defaultLocale ? `/` : `/${locale}`),
        },
        {
          text: 'Talks',
          onClick: () =>
            $router.push(
              locale === defaultLocale ? `/talks` : `/${locale}/talks`
            ),
        },
      ]"
    />

    <BaseDate created-at="2025-08-01" updated-at="2025-08-01" />

    <ElmHeading>
      {{ t("talks.title") }}
    </ElmHeading>

    <ElmParagraph>
      {{ t("talks.description") }}
    </ElmParagraph>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElmHeading, ElmBreadcrumb, ElmParagraph } from "@elmethis/core";
const { locale, defaultLocale, t } = useI18n();
</script>

<style module lang="scss">
.talks-container {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
