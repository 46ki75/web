import { Resource, component$, useResource$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { ElmHeading, ElmMarkdown, ElmRectangleWave } from "@elmethis/qwik";
import { Language } from "~/types";
import { CredlyBadge } from "./credly-badge";

import styles from "./credly-badge-wallet.module.scss";

export interface CredlyBadgeWalletProps {
  language: Language;
}

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

const translation: Record<
  Language,
  {
    credly: string;
  }
> = {
  en: { credly: credlyEn },
  ja: { credly: credlyJa },
};

const fetchBadges = server$(async () => {
  const res = await fetch(CREDLY_BADGES_ENDPOINT);
  const json = await res.json();
  return json.data.map((badge: any) => ({
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
});

export const CredlyBadgeWallet = component$<CredlyBadgeWalletProps>(
  ({ language }) => {
    const badgesResource = useResource$<any[]>(() => {
      return fetchBadges();
    });

    return (
      <div class={styles["badge-wallet"]}>
        <ElmHeading level={2} style={{ "--margin-block": "2rem" }}>
          Credly Badge Wallet
        </ElmHeading>

        <ElmMarkdown markdown={translation[language].credly} />

        <div class={styles["badge-container"]}>
          <Resource
            value={badgesResource}
            onPending={() => (
              <div class={styles["badge-container-fallback"]}>
                <ElmRectangleWave />
              </div>
            )}
            onRejected={() => <div>Failed to load badges.</div>}
            onResolved={(badges) => (
              <>
                {badges.map((badge: any, index) => (
                  <CredlyBadge
                    key={badge.id}
                    src={badge.badge_template.image_url}
                    alt={badge.badge_template.description}
                    href={badge.badge_template.url}
                    name={badge.badge_template.name}
                    issued_at_date={badge.issued_at_date}
                    expires_at_date={badge.expires_at_date}
                    delay={25 * index}
                  />
                ))}
              </>
            )}
          />
        </div>
      </div>
    );
  },
);
