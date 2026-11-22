import type { RouteProps } from "@solidjs/router";
import { defineFileRoute } from "@solidjs/router/fs";
import { createMemo, Loading, Show } from "solid-js";

import { ogImageUrl } from "~/data/content-paths";
import { BlogArticle } from "~/components/blog/blog-article";
import { NotFound } from "~/components/common/not-found";
import { Seo } from "~/components/common/seo";
import { getBlogArticle } from "~/data/blog";
import { useI18n } from "~/i18n/context";
import { localeFromRouteParam } from "~/i18n/locale";
import { absoluteUrl } from "~/utils/site";

export const route = defineFileRoute("/:lang?/blog/article/:slug", {
  preload({ params }) {
    const locale = localeFromRouteParam(params.lang);
    if (locale) {
      void getBlogArticle(params.slug, locale);
    }
  },
});

export default function BlogArticleRoute(props: RouteProps<typeof route>) {
  const { locale } = useI18n();
  const article = createMemo(() => getBlogArticle(props.params.slug, locale()));

  return (
    <Loading>
      <Show
        when={article().contents}
        keyed
        fallback={
          <NotFound>
            <Seo
              title="Not Found"
              locale={locale()}
              pathname={props.location.pathname}
              type="website"
              noIndex
            />
          </NotFound>
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
              availableLocales={resolved.availableLocales}
              image={ogImageUrl(resolved.meta.slug, locale())}
              jsonLd={{
                "@context": "https://schema.org",
                "@type": "Article",
                headline: resolved.meta.title,
                description: resolved.meta.description,
                datePublished: resolved.meta.created_at,
                dateModified: resolved.meta.updated_at,
                inLanguage: locale(),
                url: absoluteUrl(props.location.pathname.replace(/\/$/, "")),
                image: absoluteUrl(ogImageUrl(resolved.meta.slug, locale())),
                author: {
                  "@type": "Person",
                  name: "Ikuma Yamashita",
                  url: absoluteUrl("/"),
                },
              }}
            />
            <BlogArticle slug={props.params.slug} contents={resolved} />
          </>
        )}
      </Show>
    </Loading>
  );
}
