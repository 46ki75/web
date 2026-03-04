import { $, component$, useContext, useVisibleTask$ } from "@builder.io/qwik";

import styles from "./language.module.scss";

import { LanguageContext, languageMap } from "~/context/language";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiTranslate } from "@mdi/js";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Language as LanguageType } from "~/types";

export type LanguageProps = object;

export const Language = component$<LanguageProps>(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const languageState = useContext(LanguageContext);

  const handleToggleLanguage = $(async () => {
    const oldLang = languageState.language;
    const newLang = oldLang === "en" ? "ja" : "en";
    languageState.language = newLang;

    document.cookie = `language=${newLang};path=/;max-age=31536000`;
    localStorage.setItem("language", newLang);

    // Remove any existing "/ja" prefix to prevent duplication
    const cleanPath = loc.url.pathname.replace(/^\/ja(\/|$)/, "/");

    if (newLang === "ja") {
      await nav(cleanPath === "/" ? "/ja/" : `/ja${cleanPath}`);
    } else {
      await nav(cleanPath);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async () => {
      const storedLanguage = localStorage.getItem(
        "language",
      ) as LanguageType | null;

      if (storedLanguage && storedLanguage !== languageState.language) {
        await handleToggleLanguage();
      } else if (!storedLanguage) {
        // First time visitor, set language based on browser settings
        const browserLanguage = navigator.language.startsWith("ja")
          ? "ja"
          : "en";
        localStorage.setItem("language", browserLanguage);

        if (browserLanguage !== languageState.language) {
          await handleToggleLanguage();
        }
      }
    },
    { strategy: "document-ready" },
  );

  return (
    <div class={styles.language} onClick$={handleToggleLanguage}>
      <ElmMdiIcon d={mdiTranslate} color="#a4863e" />
      <div class={styles["language-container"]}>
        <span class={styles["language-label"]}>
          <ElmInlineText text="Language" />
        </span>
        <span class={styles["language-name"]}>
          <ElmInlineText>{languageMap[languageState.language]}</ElmInlineText>
        </span>
      </div>
    </div>
  );
});
