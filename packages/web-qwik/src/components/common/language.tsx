import styles from "./language.module.css";

import { ElmInlineText, ElmMdiIcon } from "@elmethis/solid";
import { mdiTranslate } from "@mdi/js";
import { useLocation, useNavigate } from "@solidjs/router";
import { useI18n } from "~/i18n/context";
import { alternateLocale, localeLabels } from "~/i18n/locale";

export function Language() {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, localizePath, t } = useI18n();

  const handleToggleLanguage = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    navigate(localizePath(currentPath, alternateLocale(locale())));
  };

  return (
    <div class={styles.language} onClick={handleToggleLanguage}>
      <ElmMdiIcon d={mdiTranslate} color="#a4863e" />
      <div class={styles["language-container"]}>
        <span class={styles["language-label"]}>
          <ElmInlineText>{t("common.language")}</ElmInlineText>
        </span>
        <span class={styles["language-name"]}>
          <ElmInlineText>{localeLabels[locale()]}</ElmInlineText>
        </span>
      </div>
    </div>
  );
}
