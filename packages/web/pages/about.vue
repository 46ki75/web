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
          text: 'About',
          onClick: () =>
            $router.push(
              locale === defaultLocale ? `/about` : `/${locale}/about`
            ),
        },
      ]"
    />

    <BaseDate :created-at="CREATED_AT" :updated-at="UPDATED_AT" />

    <ElmMarkdown :markdown="t('about.greet')" />

    <ElmHeading :level="2" disable-fragment-identifier>Find me on</ElmHeading>

    <div :class="$style['find-me']">
      <ElmBookmarkIcon
        title="GitHub"
        name="GitHub"
        href="https://github.com/46ki75"
        favicon="https://github.githubassets.com/favicons/favicon.svg"
      />
      <ElmBookmarkIcon
        title="LinkedIn"
        name="LinkedIn"
        href="https://www.linkedin.com/in/ikuma-yamashita-b3080a344/"
        favicon="https://static.licdn.com/aero-v1/sc/h/akt4ae504epesldzj74dzred8"
      />
      <!-- MIT Iconify fluent-color:mail-28 -->
      <ElmBookmarkIcon
        title="Email"
        name="Email"
        href="mailto:me@ikuma.cloud"
        favicon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI4IDI4Ij48ZyBmaWxsPSJub25lIj48cGF0aCBmaWxsPSIjMzY3YWYyIiBkPSJNMi4wMDQgOC41MDNWMTkuMjVBMy43NSAzLjc1IDAgMCAwIDUuNzU0IDIzSDIyLjI1QTMuNzUgMy43NSAwIDAgMCAyNiAxOS4yNVY4LjVsLTExLjY1OCA1Ljk3MmEuNzUuNzUgMCAwIDEtLjY4NCAweiIvPjxwYXRoIGZpbGw9InVybCgjU1ZHc01UTnJjR1EpIiBkPSJNMi4wMDQgOC41MDNWMTkuMjVBMy43NSAzLjc1IDAgMCAwIDUuNzU0IDIzSDIyLjI1QTMuNzUgMy43NSAwIDAgMCAyNiAxOS4yNVY4LjVsLTExLjY1OCA1Ljk3MmEuNzUuNzUgMCAwIDEtLjY4NCAweiIvPjxwYXRoIGZpbGw9InVybCgjU1ZHV3ptT2JiWVQpIiBkPSJNMi4wMDQgOC41MDNWMTkuMjVBMy43NSAzLjc1IDAgMCAwIDUuNzU0IDIzSDIyLjI1QTMuNzUgMy43NSAwIDAgMCAyNiAxOS4yNVY4LjVsLTExLjY1OCA1Ljk3MmEuNzUuNzUgMCAwIDEtLjY4NCAweiIvPjxwYXRoIGZpbGw9InVybCgjU1ZHNTZTNjhHUUEpIiBmaWxsLW9wYWNpdHk9IjAuNzUiIGQ9Ik0yLjAwNCA4LjUwM1YxOS4yNUEzLjc1IDMuNzUgMCAwIDAgNS43NTQgMjNIMjIuMjVBMy43NSAzLjc1IDAgMCAwIDI2IDE5LjI1VjguNWwtMTEuNjU4IDUuOTcyYS43NS43NSAwIDAgMS0uNjg0IDB6Ii8+PHBhdGggZmlsbD0idXJsKCNTVkc0MmVjUWI3bCkiIGZpbGwtb3BhY2l0eT0iMC43IiBkPSJNMi4wMDQgOC41MDNWMTkuMjVBMy43NSAzLjc1IDAgMCAwIDUuNzU0IDIzSDIyLjI1QTMuNzUgMy43NSAwIDAgMCAyNiAxOS4yNVY4LjVsLTExLjY1OCA1Ljk3MmEuNzUuNzUgMCAwIDEtLjY4NCAweiIvPjxwYXRoIGZpbGw9InVybCgjU1ZHWEVOd09wdVEpIiBkPSJNMi4wMDQgNy43NUEzLjc1IDMuNzUgMCAwIDEgNS43NTQgNEgyMi4yNUEzLjc1IDMuNzUgMCAwIDEgMjYgNy43NXYxLjJsLTExLjY1OCA1Ljk3MmEuNzUuNzUgMCAwIDEtLjY4NCAwTDIuMDA0IDguOTUzeiIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHc01UTnJjR1EiIHgxPSIxNy41IiB4Mj0iMjMuMTY4IiB5MT0iMTAuNSIgeTI9IjIzLjcwMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iLjE5OSIgc3RvcC1jb2xvcj0iIzAwOTRmMCIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIuNDMxIiBzdG9wLWNvbG9yPSIjMDA5NGYwIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9IlNWR1d6bU9iYllUIiB4MT0iMTAuNTc0IiB4Mj0iNC41NSIgeTE9IjEwLjAyNiIgeTI9IjI0LjE1NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iLjE5MSIgc3RvcC1jb2xvcj0iIzAwOTRmMCIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIuNDMxIiBzdG9wLWNvbG9yPSIjMDA5NGYwIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9IlNWRzU2UzY4R1FBIiB4MT0iMjAuMzI5IiB4Mj0iMjEuMzA1IiB5MT0iMTcuMTUxIiB5Mj0iMjQuMzQ1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzI3NjRlNyIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMjc2NGU3Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9IlNWRzQyZWNRYjdsIiB4MT0iMTcuNzE2IiB4Mj0iMTkuNDk2IiB5MT0iMTAuMjgxIiB5Mj0iMjQuOTIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuNTMzIiBzdG9wLWNvbG9yPSIjZmY2Y2U4IiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZjZjZTgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHWEVOd09wdVEiIHgxPSI5LjEzMyIgeDI9IjE2LjQ3NyIgeTE9Ii41NTUiIHkyPSIxOS43ODkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNmNlMGZmIi8+PHN0b3Agb2Zmc2V0PSIuNDYyIiBzdG9wLWNvbG9yPSIjMjljM2ZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNDg5NGZlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9nPjwvc3ZnPg=="
      />
    </div>

    <ElmHeading :level="2" disable-fragment-identifier>
      Credly Badge Wallet
    </ElmHeading>

    <ElmMarkdown :markdown="t('about.credly')" />

    <div :class="$style['badge-container']">
      <AboutCredlyBadge
        v-for="badge in data"
        :key="badge.id"
        :src="badge.badge_template.image_url"
        :alt="badge.badge_template.description"
        :href="badge.badge_template.url"
        :name="badge.badge_template.name"
        :issued_at_date="badge.issued_at_date"
        :expires_at_date="badge.expires_at_date"
      ></AboutCredlyBadge>
    </div>
  </BaseContainer>
</template>

<script setup lang="ts">
import {
  ElmHeading,
  ElmBreadcrumb,
  ElmMarkdown,
  ElmBookmarkIcon,
} from "@elmethis/core";

const CREDLY_BADGES_ENDPOINT =
  "https://www.credly.com/users/ikuma-yamashita/badges.json";
const CREDLY_LEGAL_ENDPOINT = "https://info.credly.com/legal";
const CREDLY_ROBOTS_ENDPOINT = "https://www.credly.com/robots.txt";

const { locale, defaultLocale, mergeLocaleMessage, t } = useI18n();

const CREATED_AT = "2025-06-02";
const UPDATED_AT = "2025-06-03";
const DESCRIPTION = {
  ja: "山下生真のポートフォリオサイトです。パブリッククラウドエンジニアとして、インフラとアプリケーションの両面で活動しています。",
  en: "This is the portfolio of Ikuma Yamashita, a public cloud engineer working across both infrastructure and application development.",
};

const appConfig = useAppConfig();

useSeoMeta({
  ogType: "article",
  title: `About | ${appConfig.SITE_NAME}`,
  ogTitle: "About",
  description: DESCRIPTION[locale.value],
  ogDescription: DESCRIPTION[locale.value],
  articlePublishedTime: CREATED_AT,
  articleModifiedTime: UPDATED_AT,
});

const aboutEn = `
# Hello.

I'm **Ikuma Yamashita**.

I work as a cloud infrastructure engineer and consultant, mainly focusing on AWS.

Since my student days, I have continued my passion for systems programming and contribute to open-source projects. I especially enjoy working with [Rust](https://www.rust-lang.org/).

Beyond system-level development, I also enjoy web development. I have tried various SPA frameworks, but my favorite is [Vue.js](https://vuejs.org/) because of its strong support for universal (isomorphic) applications.

One of my hobbies is creating digital illustrations.

I am currently based in Tokyo, Japan.

## About Japan AWS Jr. Champions

I was selected as one of the [2025 Japan AWS Jr. Champions](https://aws.amazon.com/jp/blogs/psa/2025-japan-aws-jr-champions/) and will be serving a term from May 2025 to April 2026. During this time, I will receive support from AWS Japan while engaging in community leadership and related activities.

> **What is Japan AWS Jr. Champions?**
>
> The *Japan AWS Jr. Champion Program* is a unique recognition program in Japan for young engineers with 1-3 years of professional experience who work at AWS partner companies.
>
> It recognizes individuals who are actively learning AWS, taking on technical challenges, and making a positive impact on those around them through community activities.
>
> Those selected are expected to become future Japan AWS Top Engineers or Japan AWS Ambassadors, and are considered outstanding young engineers.
`;

const aboutJa = `
# 皆様、こんにちは。

**山下 生真** (**Ikuma Yamashita**) です。

AWS を中心に、パブリッククラウドのインフラエンジニア及びコンサルタントとして働いています。

学生時代から好きなシステムプログラミングを続けていて、オープンソースにも貢献しています。[Rust](https://www.rust-lang.org/) が特に好きです。

システム系だけでなく、Web 開発も好きで様々な SPA フレームワークを触ってきましたが、ユニバーサル対応に強いという理由で [Vue.js](https://vuejs.org/) がお気に入りです。

趣味はデジタルイラストを描くことです。

現在、東京を拠点に活動しています。

## Japan AWS Jr. Champions について

私は [2025 Japan AWS Jr. Champions](https://aws.amazon.com/jp/blogs/psa/2025-japan-aws-jr-champions/) に選出され、2025年 5月 ~ 2026年 4月 の任期で AWS Japan の後援を受けながらコミュニティのリードなどの活動を行わせて頂いております。

> **Japan AWS Jr. Champions** とは
>
> 「Japan AWS Jr. Champion Program」は、AWSパートナー企業で働く社会人歴1～3年目の若手エンジニアを対象とした日本独自の認定プログラムです。
>
> AWSを積極的に学び、技術的な挑戦やコミュニティ活動を通じて周囲に影響を与えている人材を選出し、コミュニティを形成します。選出された方々は、将来的にJapan AWS Top EngineersやJapan AWS Ambassadorsとなることが期待される優秀な若手エンジニアです。
`;

const credlyEn = `
Credly badges are displayed in accordance with [Credly's Terms of Service](${CREDLY_LEGAL_ENDPOINT}) and its [robots.txt](${CREDLY_ROBOTS_ENDPOINT}).[Data Source (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

const credlyJa = `
Credly のバッジは[規約](${CREDLY_LEGAL_ENDPOINT})および同ドメインの [robots.txt](${CREDLY_ROBOTS_ENDPOINT}) に基づいて表示しています。[データソース (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

mergeLocaleMessage("en", { about: { greet: aboutEn, credly: credlyEn } });
mergeLocaleMessage("ja", { about: { greet: aboutJa, credly: credlyJa } });

const { data } = useAsyncData("CredlyBadges", async () => {
  const res = await $fetch<{
    data: Array<{
      id: string;
      issued_at_date: string;
      expires_at_date: string | null;
      badge_template: {
        name: string;
        description: string;
        image_url: string;
        url: string;
      };
    }>;
  }>(CREDLY_BADGES_ENDPOINT);

  return res.data.map(
    ({
      id,
      issued_at_date,
      expires_at_date,
      badge_template: { name, description, image_url, url },
    }) => ({
      id,
      issued_at_date,
      expires_at_date,
      badge_template: { name, description, image_url, url },
    })
  );
});
</script>

<style module lang="scss">
.greet {
  margin-block: 2rem;
  color: #3e434b;

  &::selection {
    color: #cccfd5;
    background-color: #3e434b;
  }

  [data-theme="dark"] & {
    color: #cccfd5;

    &::selection {
      color: #3e434b;
      background-color: #cccfd5;
    }
  }
}

.badge-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  gap: 2rem 0.25rem;
  user-select: none;
}

.find-me {
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  opacity: 0.8;
}
</style>
