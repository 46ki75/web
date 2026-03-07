import { component$ } from "@builder.io/qwik";

import styles from "./blog-author.module.scss";
import { Language } from "~/types";

import ImgProfileIcon from "../../assets/icons/profile-icon.webp?jsx";
import ImgGitHubIcon from "../../assets/icons/github.svg?jsx";

import { ElmInlineText } from "@elmethis/qwik";

export interface BlogAuthorProps {
  language: Language;
}

const translations: Record<Language, { selfIntroduction: string }> = {
  en: {
    selfIntroduction:
      "I like Rust. For work, I'm an infrastructure engineer, and as a hobby, I'm an application engineer. I enjoy drawing illustrations and other creative pursuits.",
  },
  ja: {
    selfIntroduction:
      "Rust が好きです。仕事ではインフラエンジニア、趣味ではアプリケーションエンジニアです。イラストなどを嗜む。",
  },
};

export const BlogAuthor = component$<BlogAuthorProps>(({ language }) => {
  return (
    <div class={styles["author"]}>
      <ImgProfileIcon class={styles.icon} />
      <ElmInlineText bold size="1.1rem">
        Ikuma Yamashita
      </ElmInlineText>
      <ElmInlineText>{translations[language]?.selfIntroduction}</ElmInlineText>
      <div class={styles["links"]}>
        <a
          href="https://github.com/46ki75"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ImgGitHubIcon class={styles["link-icon"]} />
        </a>
      </div>
    </div>
  );
});
