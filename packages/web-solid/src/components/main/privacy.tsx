import en from "./privacy.en.md?raw";
import ja from "./privacy.ja.md?raw";

import { ElmMarkdown } from "@elmethis/solid";
import { MainContainer } from "../common/main-container";
import { Meta } from "../common/meta";
import { useNavigate } from "@solidjs/router";
import { useI18n } from "~/i18n/context";
import type { Locale } from "~/i18n/locale";

const markdown: Record<Locale, string> = {
  en,
  ja,
};

export function Privacy() {
  const navigate = useNavigate();
  const { locale, localizePath, t } = useI18n();

  return (
    <div>
      <MainContainer>
        <Meta
          title={t("common.privacyPolicy")}
          links={[
            {
              text: t("common.home"),
              onClick: () => navigate(localizePath("/")),
            },
            {
              text: t("common.privacyPolicy"),
              onClick: () => navigate(localizePath("/privacy")),
            },
          ]}
          createdAt="2023-10-01"
          updatedAt="2026-03-06"
        />

        <ElmMarkdown markdown={markdown[locale()]} />
      </MainContainer>
    </div>
  );
}
