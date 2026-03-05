import { $, component$ } from "@builder.io/qwik";

import en from "./privacy.en.md?raw";
import ja from "./privacy.ja.md?raw";

import { ElmMarkdown } from "@elmethis/qwik";
import { MainContainer } from "../common/main-container";
import { Meta } from "../common/meta";
import { Language } from "~/types";
import { useNavigate } from "@builder.io/qwik-city";

const translation: Record<Language, { title: string; markdown: string }> = {
  en: {
    title: "Privacy Policy",
    markdown: en,
  },
  ja: {
    title: "プライバシーポリシー",
    markdown: ja,
  },
};

export interface PrivacyProps {
  language: Language;
}

export const Privacy = component$<PrivacyProps>(({ language }) => {
  const nav = useNavigate();

  return (
    <div>
      <MainContainer>
        <Meta
          title={translation[language].title}
          links={[
            {
              text: "Home",
              onClick$: $(() => nav(language === "en" ? "/" : "/ja/")),
            },
            {
              text: "Privacy Policy",
              onClick$: $(() =>
                nav(language === "en" ? "/privacy" : "/ja/privacy"),
              ),
            },
          ]}
          createdAt="2023-10-01"
          updatedAt="2026-03-06"
        />

        <ElmMarkdown markdown={translation[language].markdown} />
      </MainContainer>
    </div>
  );
});
