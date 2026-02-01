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
          text: 'Privacy Policy',
          onClick: () =>
            $router.push(
              locale === defaultLocale ? `/privacy` : `/${locale}/privacy`
            ),
        },
      ]"
    />

    <section :class="$style.section">
      <ElmHeading :level="1" disable-fragment-identifier>
        <ElmInlineText :text="t('privacy.title')" />
      </ElmHeading>

      <BaseDate created-at="2025-06-02" updated-at="2025-06-02" />
    </section>

    <article>
      <ElmMarkdown :markdown="t('privacy.markdown')" />
    </article>
  </BaseContainer>
</template>

<script setup lang="ts">
import {
  ElmHeading,
  ElmBreadcrumb,
  ElmInlineText,
  ElmMarkdown,
} from "@elmethis/vue";

const { t, locale, defaultLocale, mergeLocaleMessage } = useI18n();

const en = `
This website recognizes the importance of personal information and handles its collection, use, and management appropriately. We are committed to protecting user privacy and comply with relevant laws and regulations regarding the handling of personal information.

This website is personally operated and managed by Ikuma Yamashita. Please note that the following content is subject to change without prior notice.

## Purpose of Use of Personal Information

- Collected information is used for bug fixes, access analysis, and service improvement.
- Since this site does not provide any input fields for personally identifiable information, only anonymous telemetry data is collected.
- This site uses Google Analytics and Amazon CloudWatch RUM. The data collected is anonymous and does not identify individuals.

## Disclaimer and Limitation of Liability

- We are not responsible for the information, services, or content provided on external sites linked from this website.
- Use of this website is at the sole responsibility of the user. Although the documents, media, links, and other information published on this website are prepared carefully with supporting evidence, we do not guarantee the accuracy or completeness of all information. Please use the information with your own discretion.
- Due to network conditions, user device environment, or other reasons, this website may not function properly.
- This website may be temporarily suspended or shut down without prior notice to users.

## Changes to the Privacy Policy

This policy may be modified without notice in accordance with changes in laws or the nature of the services provided.

## Recommended Environment

Even under the recommended environment, some functions may not be available depending on the user's settings, OS and browser combination, or device characteristics.

- Supported browsers:
  - Chromium-based browsers (latest stable)
  - Firefox (latest)
- WebKit-based browsers (e.g., Safari) are not verified.
- The recommended environment is subject to change without prior notice.
`;

const ja = `
当サイトは、個人情報の重要性を認識し、適切な収集・利用・管理を行います。利用者のプライバシー保護に最大限配慮し、個人情報の取り扱いについては関連する法令を遵守します。

当ウェブサイトは、山下 生真が個人で運営・管理しております。なお、以下の内容は予告なく変更される場合がございますので、あらかじめご了承ください。

## 個人情報の利用目的

- 収集した情報は、不具合の修正、アクセス解析、サービス改善のために利用します。
- 本サイトにおいては個人を特定する情報の入力機会がないため、匿名のテレメトリーデータの収集に限られます。
- 当サイトでは、Google Analytics 及び Amazon CloudWatch RUM を使用しています。これにより収集されるデータは匿名であり、個人を特定するものではありません。

## 保証および責任制限について

- 当サイトのリンク先で提供される情報・サービス等については責任を負いかねます。
- 当サイトのご利用は、利用者様ご自身の責任において行われるものとします。当ウェブサイト上に掲載する文書・メディア・リンクその他各種情報等については、裏付けを取り慎重に作成しておりますが、全ての情報の正確性および完全性を保証するものではございませんので、あらかじめご了承ください。
- 通信環境、あるいは利用者様の端末等や他の理由により、当ウェブサイトが正常にご利用できない場合がございます。
- 利用者様へ事前の告知なしに当ウェブサイトを休止、あるいは停止することがございます。

## プライバシーポリシーの変更

法令変更やサービス内容に応じて、予告なく変更する場合があります。

## 推奨環境

推奨環境でも、利用者様の設定やOSとブラウザの組み合わせ、端末の特性などにより一部の機能が利用できない場合があります。

- 対応ブラウザ:
  - Chromium系ブラウザ (最新安定版) 
  - Firefox (最新) 
- WebKit系ブラウザ (例: Safari) は未検証です。
- 推奨環境は予告なく変更される場合があります。
`;

mergeLocaleMessage("en", { privacy: { markdown: en } });
mergeLocaleMessage("ja", { privacy: { markdown: ja } });
</script>

<style module lang="scss">
.section {
  margin-bottom: 4rem;
}
</style>
