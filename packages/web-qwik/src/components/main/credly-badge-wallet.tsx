import { ElmHeading, ElmMarkdown, ElmRectangleWave } from "@elmethis/solid";
import { createAsync, query } from "@solidjs/router";
import { ErrorBoundary, For, Suspense } from "solid-js";
import { useI18n } from "~/i18n/context";
import type { Locale } from "~/i18n/locale";
import { CredlyBadge } from "./credly-badge";

import styles from "./credly-badge-wallet.module.css";

const CREDLY_BADGES_ENDPOINT =
  "https://www.credly.com/users/ikuma-yamashita/badges.json";
const CREDLY_LEGAL_ENDPOINT = "https://info.credly.com/legal";
const CREDLY_ROBOTS_ENDPOINT = "https://www.credly.com/robots.txt";

const credlyEn = `
Credly badges are displayed in accordance with [Credly's Terms of Service](${CREDLY_LEGAL_ENDPOINT}) and its [robots.txt](${CREDLY_ROBOTS_ENDPOINT}).[Data Source (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

const credlyJa = `
Credly のバッジは[規約](${CREDLY_LEGAL_ENDPOINT})および同ドメインの [robots.txt](${CREDLY_ROBOTS_ENDPOINT}) に基づいて表示しています。[データソース (JSON)](${CREDLY_BADGES_ENDPOINT})
`;

const translation: Record<Locale, { credly: string }> = {
  en: { credly: credlyEn },
  ja: { credly: credlyJa },
};

interface CredlyBadgeData {
  id: string;
  issued_at_date: string;
  expires_at_date?: string | null;
  badge_template: {
    name: string;
    description: string;
    image_url: string;
    url: string;
  };
}

const fetchBadges = query(async (): Promise<CredlyBadgeData[]> => {
  "use server";

  const response = await fetch(CREDLY_BADGES_ENDPOINT);
  if (!response.ok) throw new Error(`Credly returned ${response.status}`);

  const json = (await response.json()) as { data: CredlyBadgeData[] };
  return json.data.map((badge) => ({
    id: badge.id,
    issued_at_date: badge.issued_at_date,
    expires_at_date: badge.expires_at_date,
    badge_template: {
      name: badge.badge_template.name,
      description: badge.badge_template.description,
      image_url: badge.badge_template.image_url,
      url: badge.badge_template.url,
    },
  }));
}, "credly-badges");

export function CredlyBadgeWallet() {
  const badges = createAsync(() => fetchBadges());
  const { locale, t } = useI18n();

  return (
    <div class={styles["badge-wallet"]}>
      <ElmHeading level={2} style={{ "margin-block": "2rem" }}>
        Credly Badge Wallet
      </ElmHeading>

      <ElmMarkdown markdown={translation[locale()].credly} />

      <div class={styles["badge-container"]}>
        <ErrorBoundary fallback={<div>{t("common.failedToLoadBadges")}</div>}>
          <Suspense
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
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
