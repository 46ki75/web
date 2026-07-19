import styles from "./header.module.css";

import LightLogo from "../../assets/brand/logo-light-label.svg?url";
import DarkLogo from "../../assets/brand/logo-dark-label.svg?url";

import {
  ElmInlineText,
  ElmMdiIcon,
  ElmToggleTheme,
  createElmethisTheme,
} from "@elmethis/solid";
import { Language } from "./language";
import { LinkLocale } from "./link-locale";
import {
  mdiAccountVoice,
  mdiHome,
  mdiNotebookMultiple,
  mdiOpenInNew,
} from "@mdi/js";
import { useI18n } from "~/i18n/context";

export function Header() {
  const { isDarkTheme } = createElmethisTheme();
  const { t } = useI18n();

  return (
    <header class={styles.header}>
      <div class={styles["header-left"]}>
        <LinkLocale href="/" class={styles.link} aria-label="To Home">
          <img
            height={40}
            width={160}
            src={isDarkTheme() ? DarkLogo : LightLogo}
            alt="Logo"
          />
        </LinkLocale>
      </div>

      <div class={styles["header-center"]}>
        <LinkLocale href="/" class={styles.link}>
          <ElmMdiIcon class={styles["header-center-icon"]} d={mdiHome} />
          <ElmInlineText>{t("common.home")}</ElmInlineText>
        </LinkLocale>

        <ElmInlineText>|</ElmInlineText>

        <LinkLocale href="/blog" class={styles.link}>
          <ElmMdiIcon
            class={styles["header-center-icon"]}
            d={mdiNotebookMultiple}
          />
          <ElmInlineText>{t("common.blog")}</ElmInlineText>
        </LinkLocale>

        <ElmInlineText>|</ElmInlineText>

        <a
          href="https://speakerdeck.com/ikuma"
          class={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ElmMdiIcon
            class={styles["header-center-icon"]}
            d={mdiAccountVoice}
          />
          <ElmInlineText>Speaker Deck</ElmInlineText>
          <ElmMdiIcon class={styles["header-center-icon"]} d={mdiOpenInNew} />
        </a>
      </div>

      <div class={styles["header-right"]}>
        <Language />
        <ElmToggleTheme />
      </div>
    </header>
  );
}
