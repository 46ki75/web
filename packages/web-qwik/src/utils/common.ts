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
  description,
  ogImage,
  language,
}: {
  url: string;
  title: string;
  language: Language;
  description?: string;
  ogImage?: string;
}) => {
  return {
    title: title,
    meta: [
      {
        name: "description",
        content: description || "Personal blog and portfolio",
      },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content: description || "Personal blog and portfolio",
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
    ],
    links: [{ rel: "canonical", href: url }],
  };
};
