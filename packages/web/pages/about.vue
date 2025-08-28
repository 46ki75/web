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

    <article>
      <ElmMarkdown :markdown="t('about.greet')" />
    </article>

    <ElmHeading :level="2" disable-fragment-identifier> Find me on </ElmHeading>

    <div :class="$style.links">
      <ElmBookmarkIcon
        name="Email"
        favicon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMiA2YzAtMS4xLS45LTItMi0ySDRjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJ6bS0yIDBsLTggNWwtOC01em0wIDEySDRWOGw4IDVsOC01eiIvPjwvc3ZnPg=="
        href="mailto:me@ikuma.cloud"
      />
      <ElmBookmarkIcon
        name="GitHub"
        favicon="https://github.githubassets.com/favicons/favicon.svg"
        href="https://github.com/46ki75"
      />
      <ElmBookmarkIcon
        name="X"
        favicon="https://about.x.com/content/dam/about-twitter/x/brand-toolkit/logo-black.png.twimg.1920.png"
        href="https://x.com/46ki75"
      />
      <ElmBookmarkIcon
        name="LinkedIn"
        favicon="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHBhdGggZmlsbD0iIzBhNjZjMiIgZD0iTTIxOC4xMjMgMjE4LjEyN2gtMzcuOTMxdi01OS40MDNjMC0xNC4xNjUtLjI1My0zMi40LTE5LjcyOC0zMi40Yy0xOS43NTYgMC0yMi43NzkgMTUuNDM0LTIyLjc3OSAzMS4zNjl2NjAuNDNoLTM3LjkzVjk1Ljk2N2gzNi40MTN2MTYuNjk0aC41MWEzOS45MSAzOS45MSAwIDAgMSAzNS45MjgtMTkuNzMzYzM4LjQ0NSAwIDQ1LjUzMyAyNS4yODggNDUuNTMzIDU4LjE4NnpNNTYuOTU1IDc5LjI3Yy0xMi4xNTcuMDAyLTIyLjAxNC05Ljg1Mi0yMi4wMTYtMjIuMDA5czkuODUxLTIyLjAxNCAyMi4wMDgtMjIuMDE2YzEyLjE1Ny0uMDAzIDIyLjAxNCA5Ljg1MSAyMi4wMTYgMjIuMDA4QTIyLjAxMyAyMi4wMTMgMCAwIDEgNTYuOTU1IDc5LjI3bTE4Ljk2NiAxMzguODU4SDM3Ljk1Vjk1Ljk2N2gzNy45N3pNMjM3LjAzMy4wMThIMTguODlDOC41OC0uMDk4LjEyNSA4LjE2MS0uMDAxIDE4LjQ3MXYyMTkuMDUzYy4xMjIgMTAuMzE1IDguNTc2IDE4LjU4MiAxOC44OSAxOC40NzRoMjE4LjE0NGMxMC4zMzYuMTI4IDE4LjgyMy04LjEzOSAxOC45NjYtMTguNDc0VjE4LjQ1NGMtLjE0Ny0xMC4zMy04LjYzNS0xOC41ODgtMTguOTY2LTE4LjQ1MyIvPjwvc3ZnPg=="
        href="https://www.linkedin.com/in/ikuma-yamashita-b3080a344"
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
  ElmBookmarkIcon,
  ElmBreadcrumb,
  ElmMarkdown,
} from "@elmethis/core";

const CREDLY_BADGES_ENDPOINT =
  "https://www.credly.com/users/ikuma-yamashita/badges.json";

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

My name is **Ikuma Yamashita**.

I work as a public cloud infrastructure engineer, with a focus on AWS.

Outside of work, I continue to enjoy programming—a passion since before my career began. I actively contribute to open source, and Rust is my favorite language.

In addition to system programming, I also enjoy web development. I've explored various SPA frameworks, but I particularly like Vue.js for its strong support for universal rendering.

In my free time, I enjoy creating digital illustrations.

I am currently based in Tokyo, Japan.
`;

const aboutJa = `
# 皆様、こんにちは。

**山下 生真** (**Ikuma Yamashita**) です。

AWS を中心に、パブリッククラウドのインフラエンジニアとして働いています。

仕事の外でも、昔から好きなプログラミングを続けていて、オープンソースにも貢献しています。Rust が特に好きです。

システム系だけでなく、Web 開発も好きで、様々な SPA フレームワークを触ってきましたが、ユニバーサル対応に強いという理由で Vue.js がお気に入りです。

趣味はデジタルイラストを描くことです。

現在、東京を拠点に活動しています。
`;

const credlyEn = `
Credly badges are displayed in accordance with [Credly's Terms of Service](https://info.credly.com/legal). [Source](${CREDLY_BADGES_ENDPOINT})
`;

const credlyJa = `
Credly のバッジは[規約](https://www.credly.com/users/ikuma-yamashita/badges.json)に基づいて表示しています。[Source](${CREDLY_BADGES_ENDPOINT})
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

.links {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  user-select: none;
  opacity: 0.8;

  [data-theme="dark"] & {
    img {
      filter: invert(1);
    }
  }
}

.badge-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  gap: 2rem 0.25rem;
  user-select: none;
}
</style>
