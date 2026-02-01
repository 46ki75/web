<template>
  <BaseContainer>
    <ElmBreadcrumb
      :links="[
        {
          text: 'Home',
          onClick: () =>
            $router.push(
              $i18n.locale === $i18n.defaultLocale ? `/` : `/${$i18n.locale}`,
            ),
        },
        {
          text: 'Talks',
          onClick: () =>
            $router.push(
              $i18n.locale === $i18n.defaultLocale
                ? `/talks`
                : `/${$i18n.locale}/talks`,
            ),
        },
      ]"
    />

    <section>
      <ElmHeading :level="1" disable-fragment-identifier>
        <ElmInlineText :text="t('talks.title')" />
      </ElmHeading>

      <BaseDate created-at="2025-09-02" updated-at="2025-10-15" />
    </section>

    <ElmParagraph>{{ t("talks.description") }}</ElmParagraph>

    <div :class="$style['talk-container']">
      <TalkCard
        v-for="talk in talks"
        :key="talk.id"
        :date="talk.date"
        :language="getLocaleName(talk.language)"
        :location="talk.location"
        :ogp="`/_notion/talks/image/${talk.id}.webp`"
        :url="talk.url"
        :title="talk.title"
      />
    </div>
  </BaseContainer>
</template>

<script setup lang="ts">
import { client } from "~/openapi/client";
import {
  ElmHeading,
  ElmInlineText,
  ElmParagraph,
  ElmBreadcrumb,
} from "@elmethis/vue";

const { t, locales } = useI18n();

const runtimeConfig = useRuntimeConfig();

const { data: talks } = useAsyncData("/api/v2/talks", async () => {
  const { data } = await client.GET("/api/v2/talks", {
    baseUrl: runtimeConfig.public.ENDPOINT,
  });
  return data;
});

const getLocaleName = (
  code: Exclude<
    Required<(typeof talks)["value"]>,
    undefined
  >[number]["language"],
) => {
  const foundLocale = locales.value.find((l) => l.code === code);
  return foundLocale?.name || code;
};
</script>

<style module lang="scss">
.talk-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
</style>
