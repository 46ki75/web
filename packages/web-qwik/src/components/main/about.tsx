import { $, component$ } from "@builder.io/qwik";

import styles from "./about.module.scss";

import en from "./about.en.md?raw";
import ja from "./about.ja.md?raw";
import { Language } from "~/types";
import { ElmHeading, ElmInlineText, ElmMarkdown } from "@elmethis/qwik";
import { MainContainer } from "../common/main-container";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";

import GitHubIcon from "../../assets/icons/github.svg?url";
import XIcon from "../../assets/icons/x.svg?url";
import PixivIcon from "../../assets/icons/pixiv.svg?url";
import LinkedInIcon from "../../assets/icons/linkedin.svg?url";
import EmailIcon from "../../assets/icons/email.svg?url";

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

const links = [
  {
    text: "GitHub",
    href: "https://github.com/46ki75",
    image: GitHubIcon,
  },
  {
    text: "X",
    href: "https://x.com/ikuma_cloud",
    image: XIcon,
  },
  {
    text: "Pixiv",
    href: "https://www.pixiv.net/en/users/120506329",
    image: PixivIcon,
  },
  {
    text: "LinkedIn",
    href: "https://www.linkedin.com/in/ikuma-yamashita-b3080a344/",
    image: LinkedInIcon,
  },
  {
    text: "Email",
    href: "mailto:me@ikuma.cloud",
    image: EmailIcon,
  },
];

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

        <div aria-hidden style={{ marginBlock: "2rem" }}></div>

        <ElmHeading level={2}>Find me on</ElmHeading>

        <div class={styles["link-container"]}>
          {links.map((link) => (
            <a
              key={link.text}
              class={styles["link"]}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img width={40} height={40} src={link.image} alt={link.text} />
              <ElmInlineText size="0.75rem">{link.text}</ElmInlineText>
            </a>
          ))}
        </div>
      </MainContainer>
    </div>
  );
});
