import { $, component$ } from "@builder.io/qwik";

import styles from "./about.module.scss";

import en from "./about.en.md?raw";
import ja from "./about.ja.md?raw";
import { Language } from "~/types";
import { ElmMarkdown } from "@elmethis/qwik";
import { MainContainer } from "../common/main-container";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";

export interface AboutProps {
  language: Language;
}

const translation: Record<
  Language,
  {
    title: string;
    markdown: string;
  }
> = {
  en: { title: "Greetings.", markdown: en },
  ja: { title: "皆様、こんにちは。", markdown: ja },
};

export const About = component$<AboutProps>(({ language }) => {
  const nav = useNavigate();

  return (
    <div class={styles["about"]}>
      <MainContainer>
        <Meta
          title={translation[language].title}
          createdAt="2023-10-01"
          updatedAt="2026-02-06"
          links={[
            {
              text: "Home",
              onClick$: $(() => nav(language === "en" ? "/" : "/ja/")),
            },
            {
              text: "About",
              onClick$: $(() =>
                nav(language === "en" ? "/about" : "/ja/about"),
              ),
            },
          ]}
        />
        <ElmMarkdown markdown={translation[language].markdown} />
      </MainContainer>
    </div>
  );
});
