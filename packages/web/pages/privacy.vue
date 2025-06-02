<template>
  <BaseContainer>
    <section :class="$style.section">
      <ElmHeading :level="1" disable-fragment-identifier>
        {{ t("privacy.title") }}
      </ElmHeading>

      <ElmParagraph>
        <ElmInlineText :text="t('privacy.basicPolicy')" />
      </ElmParagraph>
    </section>

    <section
      v-for="(body, index) in MAP[locale]"
      :key="index"
      :class="$style.section"
    >
      <ElmHeading :level="2" disable-fragment-identifier>
        {{ body.heading }}
      </ElmHeading>
      <ElmParagraph>
        <ElmInlineText
          v-for="content in body.contents"
          :key="content"
          :text="content"
        />
      </ElmParagraph>
    </section>
  </BaseContainer>
</template>

<script setup lang="ts">
import { ElmHeading, ElmInlineText, ElmParagraph } from "@elmethis/core";

const { t, locale } = useI18n();

const MAP: Record<
  "en" | "ja",
  Array<{ heading: string; contents: string[] }>
> = {
  en: [
    {
      heading: "Purpose of Use of Personal Information",
      contents: [
        "Collected information is used for bug fixes, access analysis, and service improvement.",
      ],
    },
    {
      heading: "About Access Analysis Tools",
      contents: [
        "This site uses Google Analytics and AWS Resource Access Manager. The data collected is anonymous and does not identify individuals.",
      ],
    },
    {
      heading: "Disclaimer",
      contents: [
        "We are not responsible for any information or services provided on external sites linked from this website.",
      ],
    },
    {
      heading: "Changes to This Privacy Policy",
      contents: [
        "This policy may be changed without notice in accordance with changes in laws or service content.",
      ],
    },
  ],

  ja: [
    {
      heading: "個人情報の利用目的",
      contents: [
        "収集した情報は、不具合の修正、アクセス解析、サービス改善のために利用します。",
      ],
    },
    {
      heading: "アクセス解析ツールについて",
      contents: [
        "当サイトでは、Google Analytics 及び AWS Resource Access Manager を使用しています。これにより収集されるデータは匿名であり、個人を特定するものではありません。",
      ],
    },
    {
      heading: "免責事項",
      contents: [
        "当サイトのリンク先で提供される情報・サービス等については責任を負いかねます。",
      ],
    },
    {
      heading: "プライバシーポリシーの変更",
      contents: [
        "法令変更やサービス内容に応じて、予告なく変更する場合があります。",
      ],
    },
  ],
} as const;
</script>

<style module lang="scss">
.section {
  margin-bottom: 4rem;
}
</style>
