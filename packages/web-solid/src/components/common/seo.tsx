import { Link, Meta as HeadMeta, Title, useHead } from "@solidjs/meta";
import { createUniqueId } from "solid-js";

import commonOgpImage from "~/assets/image/ogp.png?url";
import { localizePath, openGraphLocales, type Locale } from "~/i18n/locale";
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
}

function JsonLd(props: { value: Record<string, unknown> }) {
  useHead({
    tag: "script",
    id: createUniqueId(),
    props: {
      type: "application/ld+json",
      get children() {
        return JSON.stringify(props.value).replace(/</g, "\\u003c");
      },
    },
    setting: { close: true },
  });
  return null;
}

export function Seo(props: SeoProps) {
  const description = () =>
    props.description ?? siteConfig[props.locale].description;
  const canonicalPath = () => localizePath(props.pathname, props.locale);
  const canonicalUrl = () => absoluteUrl(canonicalPath());
  const enUrl = () => absoluteUrl(localizePath(props.pathname, "en"));
  const jaUrl = () => absoluteUrl(localizePath(props.pathname, "ja"));
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
      <HeadMeta
        property="og:locale:alternate"
        content={openGraphLocales[props.locale === "en" ? "ja" : "en"]}
      />
      <HeadMeta name="twitter:card" content="summary_large_image" />
      <HeadMeta name="twitter:title" content={props.title} />
      <HeadMeta name="twitter:description" content={description()} />
      <HeadMeta name="twitter:image" content={image()} />
      <HeadMeta name="twitter:creator" content="@ikuma_cloud" />
      <HeadMeta name="twitter:site" content="@ikuma_cloud" />
      {props.noIndex && <HeadMeta name="robots" content="noindex,follow" />}
      <Link rel="canonical" href={canonicalUrl()} />
      <Link rel="alternate" hreflang="x-default" href={enUrl()} />
      <Link rel="alternate" hreflang="en" href={enUrl()} />
      <Link rel="alternate" hreflang="ja" href={jaUrl()} />
      <JsonLd value={jsonLd()} />
    </>
  );
}
