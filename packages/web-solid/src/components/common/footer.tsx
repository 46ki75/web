import { version } from "../../../package.json";

import LightLogo from "../../assets/brand/logo-light.svg?url";
import DarkLogo from "../../assets/brand/logo-dark.svg?url";

import ImgGitHub from "../../assets/icons/github.svg?url";

import styles from "./footer.module.css";
import {
  createElmethisTheme,
  ElmInlineText,
  ElmMdiIcon,
} from "@elmethis/solid";
import { LinkLocale } from "./link-locale";
import { mdiLinkVariant, mdiOpenInNew, mdiSitemap } from "@mdi/js";
import { useI18n } from "~/i18n/context";
import type { Locale } from "~/i18n/locale";

const labels: Record<Locale, { about: string; blogs: string }> = {
  en: { about: "About", blogs: "Blogs" },
  ja: { about: "このサイトについて", blogs: "ブログ" },
};

export function Footer() {
  const { locale, t } = useI18n();

  const currentYear = new Date().getFullYear();
  const dateBuildMeta = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const build = `v${version}+${dateBuildMeta}`;

  const { isDarkTheme } = createElmethisTheme();

  return (
    <footer class={styles.footer}>
      <div class={styles["footer-container"]}>
        <div class={styles["footer-sitelink-container"]}>
          <div style={{ "margin-bottom": "0.5em" }}>
            <span
              class={styles["footer-heading"]}
              style={{ "font-size": "1em", "font-weight": "bold" }}
            >
              <ElmInlineText>SITE</ElmInlineText>
            </span>
          </div>

          <LinkLocale class={styles["footer-sitelink"]} href="/about">
            <ElmMdiIcon d={mdiLinkVariant} class={styles["footer-link-icon"]} />
            <ElmInlineText>{labels[locale()].about}</ElmInlineText>
          </LinkLocale>

          <LinkLocale class={styles["footer-sitelink"]} href="/privacy">
            <ElmMdiIcon d={mdiLinkVariant} class={styles["footer-link-icon"]} />
            <ElmInlineText>{t("common.privacyPolicy")}</ElmInlineText>
          </LinkLocale>

          <LinkLocale class={styles["footer-sitelink"]} href="/blog">
            <ElmMdiIcon d={mdiLinkVariant} class={styles["footer-link-icon"]} />
            <ElmInlineText>{labels[locale()].blogs}</ElmInlineText>
          </LinkLocale>

          <a
            class={styles["footer-sitelink"]}
            href="https://speakerdeck.com/ikuma"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ElmMdiIcon d={mdiOpenInNew} class={styles["footer-link-icon"]} />
            <ElmInlineText>Speaker Deck</ElmInlineText>
          </a>
        </div>

        <hr class={styles["footer-divider"]} />
        <div class={styles["footer-bottom"]}>
          <div class={styles["footer-bottom-left"]}>
            <LinkLocale
              href="/"
              class={styles["footer-logo"]}
              aria-label="Home"
            >
              <img
                height={24}
                width={24}
                src={isDarkTheme() ? DarkLogo : LightLogo}
                alt="Logo"
              />
            </LinkLocale>

            <div class={styles["footer-meta"]}>
              <ElmInlineText size="0.8rem">
                Ikuma Yamashita 2022 - {currentYear}
              </ElmInlineText>
            </div>
            <div class={styles["footer-meta"]}>
              <ElmInlineText size="0.8rem">{build}</ElmInlineText>
            </div>
          </div>

          <div class={styles["footer-bottom-right"]}>
            <a
              class={styles["footer-icon"]}
              rel="noopener noreferrer"
              href="/sitemap-index.xml"
              target="_blank"
              aria-label="Sitemap"
            >
              <ElmMdiIcon d={mdiSitemap} size="1.5rem" />
            </a>

            <a
              class={styles["footer-icon"]}
              rel="noopener noreferrer"
              href="https://github.com/46ki75/web"
              target="_blank"
              aria-label="Source code on GitHub"
            >
              <img src={ImgGitHub} class={styles["footer-icon"]} alt="" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
