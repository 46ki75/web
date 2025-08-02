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

    <div :class="$style['talks-container']">
      <TalkCard
        v-for="talk in talkStore[locale].talks"
        :key="talk.url"
        :url="talk.url"
        :title="talk.title"
        :ogp="String(talk.image)"
        :language="talk.lang === 'JA' ? 'Japanese' : 'English'"
        :date="talk.date"
        :location="talk.location[locale]"
      />
    </div>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElmHeading, ElmBreadcrumb, ElmParagraph } from "@elmethis/core";
const { locale, defaultLocale, t } = useI18n();

const talkStore = useTalkStore();
</script>

<style module lang="scss">
@use "../styles/variables";

.talks-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  justify-content: space-between;
  gap: 0.5rem;

  @media (max-width: #{variables.$breakpoint-mobile}) {
    grid-template-columns: 1fr;
  }
}
</style>
