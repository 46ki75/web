import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading } from "solid-js";

import { BlogLayout } from "~/components/blog/blog-layout";
import { getBlogData } from "~/data/blog";
import { useI18n } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";

export const route = defineFileRoute("/:lang?/blog", {
  preload({ params }) {
    const locale = localeFromRouteParam(params.lang);
    if (locale) {
      void getBlogData(locale);
    }
  },
});

export default function BlogRouteLayout(props: RouteProps<typeof route>) {
  const { locale } = useI18n();
  const data = createMemo(() => getBlogData(locale()));

  return (
    <Loading>
      <BlogLayout blogMeta={data().blogMeta} tags={data().tags}>
        {props.children}
      </BlogLayout>
    </Loading>
  );
}
