import { useLocation } from "@solidjs/router";

import { BlogIndex } from "~/components/blog/blog-index";
import { Seo } from "~/components/common/seo";
import { useI18n } from "~/i18n/context";

export default function BlogIndexRoute() {
  const location = useLocation();
  const { locale, t } = useI18n();

  return (
    <>
      <Seo
        title="Blog"
        description={t("blog.description")}
        locale={locale()}
        pathname={location.pathname}
        type="website"
      />
      <BlogIndex />
    </>
  );
}
