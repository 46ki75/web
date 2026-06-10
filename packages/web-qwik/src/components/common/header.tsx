import { component$, useContext } from "@qwik.dev/core";

import styles from "./header.module.css";

import LightLogo from "../../assets/brand/logo-light-label.svg?url";
import DarkLogo from "../../assets/brand/logo-dark-label.svg?url";

import {
  ElmInlineText,
  ElmMdiIcon,
  ElmToggleTheme,
  useElmethisTheme,
} from "@elmethis/qwik";
import { Language } from "./language";
import { LinkLocale } from "./link-locale";
import {
  mdiAccountVoice,
  mdiHome,
  mdiNotebookMultiple,
  mdiOpenInNew,
} from "@mdi/js";
import { LanguageContext } from "~/context/language";

export const Header = component$(() => {
  const languageState = useContext(LanguageContext);

  const { isDarkTheme } = useElmethisTheme();

  return (
    <header class={styles.header}>
      <div class={styles["header-left"]}>
        <LinkLocale
          href="/"
          class={styles.link}
          lang={languageState.language}
          aria-label="To Home"
        >
          <img
            height={40}
            width={160}
            src={isDarkTheme.value ? DarkLogo : LightLogo}
            alt="Logo"
          />
        </LinkLocale>
      </div>

      <div class={styles["header-center"]}>
        <LinkLocale href="/" class={styles.link} lang={languageState.language}>
          <ElmMdiIcon d={mdiHome} />
          <ElmInlineText>Home</ElmInlineText>
        </LinkLocale>

        <ElmInlineText>|</ElmInlineText>

        <LinkLocale
          href="/blog"
          class={styles.link}
          lang={languageState.language}
        >
          <ElmMdiIcon d={mdiNotebookMultiple} />
          <ElmInlineText>Blog</ElmInlineText>
        </LinkLocale>

        <ElmInlineText>|</ElmInlineText>

        <a
          href="https://speakerdeck.com/ikuma"
          class={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ElmMdiIcon d={mdiAccountVoice} />
          <ElmInlineText>Speaker Deck</ElmInlineText>
          <ElmMdiIcon d={mdiOpenInNew} />
        </a>
      </div>

      <div class={styles["header-right"]}>
        <Language />
        <ElmToggleTheme />
      </div>
    </header>
  );
});
