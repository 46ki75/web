import { ElmHeading, ElmMarkdown, ElmRectangleWave } from "@elmethis/solid";
import { query } from "@solidjs/router";
import { createMemo, Errored, For, Loading } from "solid-js";
import { requireContent } from "~/data/content";
import {
  badgesPath,
  credlySource,
  type CredlyBadgeData,
} from "~/data/content-paths";
import { useI18n } from "~/i18n/context";
import type { Locale } from "~/i18n/locale";
import { CredlyBadge } from "./credly-badge";

import styles from "./credly-badge-wallet.module.css";

const CREDLY_LEGAL_ENDPOINT = "https://info.credly.com/legal";
const CREDLY_ROBOTS_ENDPOINT = "https://www.credly.com/robots.txt";

const credlyEn = `
Credly badges are displayed in accordance with [Credly's Terms of Service](${CREDLY_LEGAL_ENDPOINT}) and its [robots.txt](${CREDLY_ROBOTS_ENDPOINT}).[Data Source (JSON)](${credlySource})
`;

const credlyJa = `
Credly のバッジは[規約](${CREDLY_LEGAL_ENDPOINT})および同ドメインの [robots.txt](${CREDLY_ROBOTS_ENDPOINT}) に基づいて表示しています。[データソース (JSON)](${credlySource})
`;

const translation: Record<Locale, { credly: string }> = {
  en: { credly: credlyEn },
  ja: { credly: credlyJa },
};

const fetchBadges = query(
  () => requireContent<CredlyBadgeData[]>(badgesPath),
  "credly-badges",
);

export function CredlyBadgeWallet() {
  const badges = createMemo(() => fetchBadges());
  const { locale, t } = useI18n();

  return (
    <div class={styles["badge-wallet"]}>
      <ElmHeading level={2} style={{ "margin-block": "2rem" }}>
        Credly Badge Wallet
      </ElmHeading>

      <ElmMarkdown markdown={translation[locale()].credly} />

      <div class={styles["badge-container"]}>
        <Errored fallback={<div>{t("common.failedToLoadBadges")}</div>}>
          <Loading
            fallback={
              <div class={styles["badge-container-fallback"]}>
                <ElmRectangleWave />
              </div>
            }
          >
            <For each={badges()}>
              {(badge, index) => (
                <CredlyBadge
                  src={badge.badge_template.image_url}
                  alt={badge.badge_template.description}
                  href={badge.badge_template.url}
                  name={badge.badge_template.name}
                  issued_at_date={badge.issued_at_date}
                  expires_at_date={badge.expires_at_date}
                  delay={25 * index()}
                />
              )}
            </For>
          </Loading>
        </Errored>
      </div>
    </div>
  );
}
