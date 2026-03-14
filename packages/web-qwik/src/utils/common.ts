import { isServer } from "@builder.io/qwik";
import { Language } from "~/types";

export const origin = () => {
  if (isServer) {
    const stageName = process.env.STAGE_NAME;
    const DOMAIN =
      stageName === "prod"
        ? "https://www-ikuma.cloud"
        : `https://${stageName}-www.ikuma.cloud`;
    return DOMAIN;
  } else {
    return location.origin;
  }
};

export const generateHead = ({
  url,
  title,
  description = "Personal blog and portfolio",
  language,
  ogType,
  ogImage,
}: {
  url: string;
  title: string;
  language: Language;
  ogType: "article" | "website" | "profile";
  description?: string;
  ogImage?: string;
}) => {
  const parsedUrl = new URL(url);
  const enUrl = url.replace("/ja", "");
  const jaUrl = parsedUrl.pathname.startsWith("/ja")
    ? url
    : `${parsedUrl.origin}/ja${parsedUrl.pathname}`;

  return {
    title: title,
    meta: [
      {
        name: "og:site_name",
        content: "SrcJar",
      },
      {
        name: "og:type",
        content: ogType,
      },
      {
        name: "description",
        content: description,
      },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content: description,
      },
      { property: "og:url", content: url },
      {
        property: "og:image",
        content: ogImage,
      },
      {
        property: "og:locale",
        content: {
          en: "en_US",
          ja: "ja_JP",
        }[language],
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: title,
      },
      {
        name: "twitter:description",
        content: description,
      },
      {
        name: "twitter:image",
        content: ogImage,
      },
      {
        name: "twitter:creator",
        content: "@ikuma_cloud",
      },
      {
        name: "twitter:site",
        content: "@ikuma_cloud",
      },
    ],
    links: [
      { rel: "canonical", href: url },
      {
        rel: "alternate",
        href: enUrl,
        hreflang: "x-default",
      },
      {
        rel: "alternate",
        href: enUrl,
        hreflang: "en",
      },
      {
        rel: "alternate",
        href: jaUrl,
        hreflang: "ja",
      },
    ],
  };
};
