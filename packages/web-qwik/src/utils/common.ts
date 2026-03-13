import { isServer } from "@builder.io/qwik";

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
}: {
  url: string;
  title: string;
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
    ],
    links: [{ rel: "canonical", href: url }],
  };
};
