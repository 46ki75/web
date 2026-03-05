import { component$ } from "@builder.io/qwik";
import { version } from "../../../package.json";
import ImgFavicon from "../../../public/static/brand/favicon.svg?jsx";
import ImgGitHub from "../../../public/static/image/github.svg?jsx";

import styles from "./footer.module.scss";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { LinkLocale } from "./link-locale";
import { mdiLinkVariant, mdiOpenInNew, mdiSitemap } from "@mdi/js";

export type FooterProps = {
  language: string;
};

export const Footer = component$<FooterProps>(({ language }) => {
  const currentYear = new Date().getFullYear();
  const dateBuildMeta = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const build = `v${version}+${dateBuildMeta}`;

  return (
    <footer class={styles.footer}>
      <div class={styles.container}>
        <div class={styles.sitelinks}>
          <div style={{ marginBottom: "0.5em" }}>
            <span
              class={styles.heading}
              style={{ fontSize: "1em", fontWeight: "bold" }}
            >
              <ElmInlineText>SITE</ElmInlineText>
            </span>
          </div>

          <LinkLocale lang={language} class={styles.sitelink} href="/about">
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>About</ElmInlineText>
          </LinkLocale>

          <LinkLocale lang={language} class={styles.sitelink} href="/privacy">
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>Privacy Policy</ElmInlineText>
          </LinkLocale>

          <LinkLocale lang={language} class={styles.sitelink} href="/blog">
            <ElmMdiIcon d={mdiLinkVariant} color="#6987b8" />
            <ElmInlineText>Blogs</ElmInlineText>
          </LinkLocale>

          <a
            class={styles.sitelink}
            href="https://speakerdeck.com/ikuma"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ElmMdiIcon d={mdiOpenInNew} color="#6987b8" />
            <ElmInlineText>Speaker Deck</ElmInlineText>
          </a>
        </div>

        <hr class={styles.hr} />
        <div class={styles.bottom}>
          <div class={styles.left}>
            <LinkLocale lang={language} href="/" class={styles.hiddenMobile}>
              <ImgFavicon class={styles.favicon} />
            </LinkLocale>

            <div class={styles.leftInner}>
              <ElmInlineText size="0.8rem">
                Ikuma Yamashita 2022 - {currentYear}
              </ElmInlineText>
            </div>
            <div class={styles.leftInner}>
              <ElmInlineText size="0.8rem">{build}</ElmInlineText>
            </div>
          </div>

          <div class={styles.right}>
            <a
              class={styles.icon}
              rel="noopener noreferrer"
              href="/sitemap.xml"
              target="_blank"
              aria-label="Sitemap"
            >
              <ElmMdiIcon d={mdiSitemap} size="1.5rem" />
            </a>

            <a
              class={styles.icon}
              rel="noopener noreferrer"
              href="https://github.com/46ki75/web"
              target="_blank"
              aria-label="Source code on GitHub"
            >
              <ImgGitHub class={styles.icon} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});
