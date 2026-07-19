import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";
import { Show, Suspense } from "solid-js";

import { ogImageUrl } from "../../../../../openapi/blog";
import { BlogArticle } from "~/components/blog/blog-article";
import { Seo } from "~/components/common/seo";
import { getBlogArticle } from "~/data/blog";
import { useI18n } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";
import { absoluteUrl } from "~/utils/site";

export const route = {
  preload({ params }) {
    const locale = localeFromRouteParam(params.lang);
    if (locale) void getBlogArticle(params.slug!, locale);
  },
} satisfies RouteDefinition;

export default function BlogArticleRoute(props: RouteSectionProps) {
  const { locale } = useI18n();
  const contents = createAsync(() =>
    getBlogArticle(props.params.slug!, locale()),
  );

  return (
    <Suspense>
      <Show
        when={contents()}
        keyed
        fallback={
          <>
            <HttpStatusCode code={404} text="Not Found" />
            <Seo
              title="Not Found"
              locale={locale()}
              pathname={props.location.pathname}
              type="website"
              noIndex
            />
            <h1>Not Found</h1>
          </>
        }
      >
        {(resolved) => (
          <>
            <Seo
              title={resolved.meta.title}
              description={resolved.meta.description}
              locale={locale()}
              pathname={props.location.pathname}
              type="article"
              image={ogImageUrl(resolved.meta.slug, locale())}
              jsonLd={{
                "@context": "https://schema.org",
                "@type": "Article",
                headline: resolved.meta.title,
                description: resolved.meta.description,
                datePublished: resolved.meta.created_at,
                dateModified: resolved.meta.updated_at,
                inLanguage: locale(),
                url: absoluteUrl(props.location.pathname),
                image: absoluteUrl(ogImageUrl(resolved.meta.slug, locale())),
                author: {
                  "@type": "Person",
                  name: "Ikuma Yamashita",
                  url: absoluteUrl("/"),
                },
              }}
            />
            <BlogArticle slug={props.params.slug!} contents={resolved} />
          </>
        )}
      </Show>
    </Suspense>
  );
}
