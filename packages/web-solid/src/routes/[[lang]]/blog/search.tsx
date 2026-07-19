import { useLocation } from "@solidjs/router";

import { BlogSearch } from "~/components/blog/blog-search";
import { Seo } from "~/components/common/seo";
import { useI18n } from "~/i18n/context";

export default function BlogSearchRoute() {
  const location = useLocation();
  const { locale, t } = useI18n();

  return (
    <>
      <Seo
        title="Blog Search"
        description={t("common.searchBlogs")}
        locale={locale()}
        pathname={location.pathname}
        type="website"
        noIndex
      />
      <BlogSearch />
    </>
  );
}
