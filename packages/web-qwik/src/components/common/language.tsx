import { component$, useContext } from "@builder.io/qwik";

import styles from "./language.module.scss";

import { LanguageContext, languageMap } from "~/context/language";
import { ElmInlineText, ElmMdiIcon } from "@elmethis/qwik";
import { mdiTranslate } from "@mdi/js";

export type LanguageProps = object;

export const Language = component$<LanguageProps>(() => {
  const languageState = useContext(LanguageContext);

  return (
    <div class={styles.language}>
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
