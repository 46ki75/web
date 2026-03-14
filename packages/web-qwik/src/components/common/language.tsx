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

  const setLanguage = $(async (newLang: LanguageType) => {
    languageState.language = newLang;

    document.cookie = `language=${newLang};path=/;max-age=31536000`;
    localStorage.setItem("language", newLang);

    // Remove any existing "/ja" prefix to prevent duplication
    const cleanPath = loc.url.pathname.replace(/^\/ja(\/|$)/, "/");
    const targetPath =
      newLang === "ja"
        ? cleanPath === "/"
          ? "/ja/"
          : `/ja${cleanPath}`
        : cleanPath;

    // Only navigate if the path actually needs to change
    if (loc.url.pathname !== targetPath) {
      await nav(targetPath);
    }
  });

  const handleToggleLanguage = $(async () => {
    await setLanguage(languageState.language === "en" ? "ja" : "en");
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    async () => {
      const storedLanguage = localStorage.getItem(
        "language",
      ) as LanguageType | null;

      if (storedLanguage && storedLanguage !== languageState.language) {
        await setLanguage(storedLanguage);
      } else if (!storedLanguage) {
        // First time visitor, set language based on browser settings
        const browserLanguage = navigator.language.startsWith("ja")
          ? "ja"
          : "en";

        if (browserLanguage !== languageState.language) {
          await setLanguage(browserLanguage);
        } else {
          // Just save it if state is already correct
          localStorage.setItem("language", browserLanguage);
          document.cookie = `language=${browserLanguage};path=/;max-age=31536000`;
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
