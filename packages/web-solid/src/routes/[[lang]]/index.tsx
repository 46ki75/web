import { useLocation } from "@solidjs/router";

import { Seo } from "~/components/common/seo";
import { Home } from "~/components/main/home";
import { useI18n } from "~/i18n/context";
import { siteConfig } from "~/meta/site-config";

export default function HomeRoute() {
  const location = useLocation();
  const { locale } = useI18n();

  return (
    <>
      <Seo
        title="Ikuma Yamashita"
        description={siteConfig[locale()].description}
        locale={locale()}
        pathname={location.pathname}
        type="profile"
      />
      <Home />
    </>
  );
}
