import { $, Resource, component$, useResource$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

import styles from "./about.module.scss";

import en from "./about.en.md?raw";
import ja from "./about.ja.md?raw";
import { Language } from "~/types";
import {
  ElmHeading,
  ElmInlineText,
  ElmMarkdown,
  ElmRectangleWave,
} from "@elmethis/qwik";
import { MainContainer } from "../common/main-container";
import { Meta } from "../common/meta";
import { useNavigate } from "@builder.io/qwik-city";

import GitHubIcon from "../../assets/icons/github.svg?url";
import XIcon from "../../assets/icons/x.svg?url";
import PixivIcon from "../../assets/icons/pixiv.svg?url";
import LinkedInIcon from "../../assets/icons/linkedin.svg?url";
import EmailIcon from "../../assets/icons/email.svg?url";

import { CredlyBadge } from "./credly-badge";

export interface AboutProps {
  language: Language;
}

const CREDLY_BADGES_ENDPOINT =
  "https://www.credly.com/users/ikuma-yamashita/badges.json";
const CREDLY_LEGAL_ENDPOINT = "https://info.credly.com/legal";
const CREDLY_ROBOTS_ENDPOINT = "https://www.credly.com/robots.txt";

const credlyEn = `
Credly badges are displayed in accordance with [Credly's Terms of Service](${CREDLY_LEGAL_ENDPOINT}) and its [robots.txt](${CREDLY_ROBOTS_ENDPOINT}).[Data Source (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

const credlyJa = `
Credly のバッジは[規約](${CREDLY_LEGAL_ENDPOINT})および同ドメインの [robots.txt](${CREDLY_ROBOTS_ENDPOINT}) に基づいて表示しています。[データソース (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

const translation: Record<
  Language,
  {
    title: string;
    markdown: string;
    credly: string;
  }
> = {
  en: { title: "Greetings.", markdown: en, credly: credlyEn },
  ja: { title: "皆様、こんにちは。", markdown: ja, credly: credlyJa },
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

const fetchBadges = server$(async () => {
  const res = await fetch(CREDLY_BADGES_ENDPOINT);
  const json = await res.json();
  return json.data.map((badge: any) => ({
    id: badge.id,
    issued_at_date: badge.issued_at_date,
    expires_at_date: badge.expires_at_date,
    badge_template: {
      name: badge.badge_template.name,
      description: badge.badge_template.description,
      image_url: badge.badge_template.image_url,
      url: badge.badge_template.url,
    },
  }));
});

export const About = component$<AboutProps>(({ language }) => {
  const nav = useNavigate();

  const badgesResource = useResource$<any[]>(() => {
    return fetchBadges();
  });

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

        <ElmHeading level={2} style={{ "--margin-block": "2rem" }}>
          Find me on
        </ElmHeading>

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

        <ElmHeading level={2} style={{ "--margin-block": "2rem" }}>
          Credly Badge Wallet
        </ElmHeading>

        <ElmMarkdown markdown={translation[language].credly} />

        <div class={styles["badge-container"]}>
          <Resource
            value={badgesResource}
            onPending={() => (
              <div class={styles["badge-container-fallback"]}>
                <ElmRectangleWave />
              </div>
            )}
            onRejected={() => <div>Failed to load badges.</div>}
            onResolved={(badges) => (
              <>
                {badges.map((badge: any, index) => (
                  <CredlyBadge
                    key={badge.id}
                    src={badge.badge_template.image_url}
                    alt={badge.badge_template.description}
                    href={badge.badge_template.url}
                    name={badge.badge_template.name}
                    issued_at_date={badge.issued_at_date}
                    expires_at_date={badge.expires_at_date}
                    delay={25 * index}
                  />
                ))}
              </>
            )}
          />
        </div>
      </MainContainer>
    </div>
  );
});
