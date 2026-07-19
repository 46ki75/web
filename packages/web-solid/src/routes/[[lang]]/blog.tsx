import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from "@solidjs/router";
import { Show, Suspense } from "solid-js";

import { BlogLayout } from "~/components/blog/blog-layout";
import { getBlogData } from "~/data/blog";
import { useI18n } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";

export const route = {
  preload({ params }) {
    const locale = localeFromRouteParam(params.lang);
    if (locale) void getBlogData(locale);
  },
} satisfies RouteDefinition;

export default function BlogRouteLayout(props: RouteSectionProps) {
  const { locale } = useI18n();
  const data = createAsync(() => getBlogData(locale()));

  return (
    <Suspense>
      <Show when={data()} keyed>
        {(resolved) => (
          <BlogLayout blogMeta={resolved.blogMeta} tags={resolved.tags}>
            {props.children}
          </BlogLayout>
        )}
      </Show>
    </Suspense>
  );
}
