import { $, component$, useContext } from "@builder.io/qwik";

import styles from "./language.module.scss";

import { LanguageContext, languageMap } from "~/context/language";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiTranslate } from "@mdi/js";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

export type LanguageProps = object;

export const Language = component$<LanguageProps>(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const languageState = useContext(LanguageContext);

  const handleToggleLanguage = $(() => {
    languageState.language = languageState.language === "en" ? "ja" : "en";
    localStorage.setItem("language", languageState.language);

    if (
      languageState.language !== "en" &&
      !loc.url.pathname.startsWith(`/${languageState.language}`)
    ) {
      nav(`/${languageState.language}${loc.url.pathname}`);
    }
  });

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
