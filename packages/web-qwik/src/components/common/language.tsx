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

  const handleToggleLanguage = $(async () => {
    const oldLang = languageState.language;
    const newLang = oldLang === "en" ? "ja" : "en";
    languageState.language = newLang;
    localStorage.setItem("language", newLang);

    if (newLang === "ja") {
      await nav(`/ja${loc.url.pathname}`);
    } else {
      await nav(loc.url.pathname.replace(/^\/ja/, "") || "/");
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
