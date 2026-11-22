import { Link, Meta as HeadMeta, Script, Title } from "@solidjs/meta";
import { Show } from "solid-js";

import commonOgpImage from "~/assets/image/ogp.png?url";
import {
  alternateLocale,
  localizePath,
  locales,
  openGraphLocales,
  type Locale,
} from "~/i18n/locale";
import { siteConfig } from "~/meta/site-config";
import { absoluteUrl } from "~/utils/site";

export interface SeoProps {
  title: string;
  description?: string;
  locale: Locale;
  pathname: string;
  type: "article" | "profile" | "website";
  image?: string;
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
  availableLocales?: readonly Locale[];
}

export function Seo(props: SeoProps) {
  const description = () =>
    props.description ?? siteConfig[props.locale].description;
  const pageUrl = (locale: Locale) =>
    absoluteUrl(localizePath(props.pathname.replace(/\/$/, ""), locale));
  const canonicalUrl = () => pageUrl(props.locale);
  const available = (locale: Locale) =>
    (props.availableLocales ?? locales).includes(locale);
  const image = () =>
    props.image
      ? props.image.startsWith("http")
        ? props.image
        : absoluteUrl(props.image)
      : absoluteUrl(commonOgpImage);
  const jsonLd = () =>
    props.jsonLd ?? {
      "@context": "https://schema.org",
      "@type": props.type === "profile" ? "ProfilePage" : "WebPage",
      name: props.title,
      description: description(),
      url: canonicalUrl(),
      inLanguage: props.locale,
      author: {
        "@type": "Person",
        name: "Ikuma Yamashita",
        url: absoluteUrl("/"),
      },
      image: image(),
    };

  return (
    <>
      <Title>{`${props.title} | ${siteConfig[props.locale].siteName}`}</Title>
      <HeadMeta name="description" content={description()} />
      <HeadMeta property="og:site_name" content="FineNight" />
      <HeadMeta property="og:type" content={props.type} />
      <HeadMeta property="og:title" content={props.title} />
      <HeadMeta property="og:description" content={description()} />
      <HeadMeta property="og:url" content={canonicalUrl()} />
      <HeadMeta property="og:image" content={image()} />
      <HeadMeta property="og:locale" content={openGraphLocales[props.locale]} />
      <Show when={available(alternateLocale(props.locale))}>
        <HeadMeta
          property="og:locale:alternate"
          content={openGraphLocales[alternateLocale(props.locale)]}
        />
      </Show>
      <HeadMeta name="twitter:card" content="summary_large_image" />
      <HeadMeta name="twitter:title" content={props.title} />
      <HeadMeta name="twitter:description" content={description()} />
      <HeadMeta name="twitter:image" content={image()} />
      <HeadMeta name="twitter:creator" content="@ikuma_cloud" />
      <HeadMeta name="twitter:site" content="@ikuma_cloud" />
      {props.noIndex && <HeadMeta name="robots" content="noindex,follow" />}
      <Link rel="canonical" href={canonicalUrl()} />
      <Show when={available("en")}>
        <Link
          key="alternate-default"
          rel="alternate"
          hreflang="x-default"
          href={pageUrl("en")}
        />
        <Link
          key="alternate-en"
          rel="alternate"
          hreflang="en"
          href={pageUrl("en")}
        />
      </Show>
      <Show when={available("ja")}>
        <Link
          key="alternate-ja"
          rel="alternate"
          hreflang="ja"
          href={pageUrl("ja")}
        />
      </Show>
      <Script type="application/ld+json">
        {JSON.stringify(jsonLd()).replace(/</g, "\\u003c")}
      </Script>
    </>
  );
}
