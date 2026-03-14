import { component$ } from "@builder.io/qwik";

import styles from "./about.module.scss";

import en from "./about.en.md?raw";
import ja from "./about.ja.md?raw";
import { Language } from "~/types";
import { ElmInlineText, ElmMarkdown } from "@elmethis/qwik";
import { FindMeOn } from "./find-me-on";

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
  return (
    <div class={styles["about"]}>
      <div>
        <h1>
          <ElmInlineText size="2.125rem">
            {translation[language].title}
          </ElmInlineText>
        </h1>

        <ElmMarkdown
          markdown={translation[language].markdown}
          style={{ "--margin-block": "1rem" }}
        />

        <FindMeOn />
      </div>
    </div>
  );
});
