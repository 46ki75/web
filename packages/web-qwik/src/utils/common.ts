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
