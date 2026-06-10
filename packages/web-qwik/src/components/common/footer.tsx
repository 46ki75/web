import { component$, useContext } from "@qwik.dev/core";
import { version } from "../../../package.json";

import LightLogo from "../../assets/brand/logo-light.svg?url";
import DarkLogo from "../../assets/brand/logo-dark.svg?url";

import ImgGitHub from "../../assets/icons/github.svg?jsx";

import styles from "./footer.module.css";
import { ElmInlineText, ElmMdiIcon, useElmethisTheme } from "@elmethis/qwik";
import { LinkLocale } from "./link-locale";
import { mdiLinkVariant, mdiOpenInNew, mdiSitemap } from "@mdi/js";
import { LanguageContext } from "~/context/language";

export const Footer = component$(() => {
  const languageState = useContext(LanguageContext);

  const currentYear = new Date().getFullYear();
  const dateBuildMeta = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const build = `v${version}+${dateBuildMeta}`;

  const { isDarkTheme } = useElmethisTheme();

  return (
    <footer class={styles.footer}>
      <div class={styles["footer-container"]}>
        <div class={styles["footer-sitelinks"]}>
          <div style={{ marginBottom: "0.5em" }}>
            <span
              class={styles["footer-heading"]}
              style={{ fontSize: "1em", fontWeight: "bold" }}
            >
              <ElmInlineText>SITE</ElmInlineText>
            </span>
          </div>

          <LinkLocale
            lang={languageState.language}
            class={styles["footer-sitelink"]}
            href="/about"
          >
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>About</ElmInlineText>
          </LinkLocale>

          <LinkLocale
            lang={languageState.language}
            class={styles["footer-sitelink"]}
            href="/privacy"
          >
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>Privacy Policy</ElmInlineText>
          </LinkLocale>

          <LinkLocale
            lang={languageState.language}
            class={styles["footer-sitelink"]}
            href="/blog"
          >
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>Blogs</ElmInlineText>
          </LinkLocale>

          <a
            class={styles["footer-sitelink"]}
            href="https://speakerdeck.com/ikuma"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ElmMdiIcon d={mdiOpenInNew} color="#6987b8" />
            <ElmInlineText>Speaker Deck</ElmInlineText>
          </a>
        </div>

        <hr class={styles["footer-divider"]} />
        <div class={styles["footer-bottom"]}>
          <div class={styles["footer-bottom-left"]}>
            <LinkLocale
              lang={languageState.language}
              href="/"
              class={styles["footer-logo"]}
              aria-label="Home"
            >
              <img
                height={24}
                width={24}
                src={isDarkTheme.value ? DarkLogo : LightLogo}
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
              <ImgGitHub class={styles["footer-icon"]} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});
