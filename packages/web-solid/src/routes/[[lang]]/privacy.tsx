import { useLocation } from "@solidjs/router";

import { Seo } from "~/components/common/seo";
import { Privacy } from "~/components/main/privacy";
import { useI18n } from "~/i18n/context";
import type { Locale } from "~/i18n/locale";

const metadata: Record<Locale, { title: string; description: string }> = {
  en: { title: "Privacy Policy", description: "Portfolio and blog" },
  ja: {
    title: "プライバシーポリシー",
    description: "ポートフォリオとブログ",
  },
};

export default function PrivacyRoute() {
  const location = useLocation();
  const { locale } = useI18n();
  const meta = () => metadata[locale()];

  return (
    <>
      <Seo
        title={meta().title}
        description={meta().description}
        locale={locale()}
        pathname={location.pathname}
        type="website"
      />
      <Privacy />
    </>
  );
}
