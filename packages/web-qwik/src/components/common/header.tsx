import { component$, useContext } from "@builder.io/qwik";

import styles from "./header.module.scss";

import Favicon from "../../../public/static/brand/logo.svg?jsx";
import { ElmInlineText, ElmMdiIcon, ElmToggleTheme } from "@elmethis/qwik";
import { Language } from "./language";
import { LinkLocale } from "./link-locale";
import {
  mdiAccount,
  mdiAccountVoice,
  mdiNotebookMultiple,
  mdiOpenInNew,
} from "@mdi/js";
import { LanguageContext } from "~/context/language";

export const Header = component$(() => {
  const languageState = useContext(LanguageContext);

  return (
    <header class={styles.header}>
      <div class={styles["header-left"]}>
        <LinkLocale href="/" class={styles.link} lang={languageState.language}>
          <Favicon style={{ height: "1.5rem", width: "min-content" }} />
        </LinkLocale>
      </div>

      <div class={styles["header-center"]}>
        <LinkLocale
          href="/about"
          class={styles.link}
          lang={languageState.language}
        >
          <ElmMdiIcon d={mdiAccount} />
          <ElmInlineText>About</ElmInlineText>
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
