export const STAGE_NAME = process?.env?.STAGE_NAME;

export const ENDPOINT =
  STAGE_NAME != null
    ? STAGE_NAME === "prod"
      ? `https://www.ikuma.cloud`
      : `https://${STAGE_NAME}-www.ikuma.cloud`
    : window.location.origin;

export const GTAG =
  STAGE_NAME === "prod"
    ? "G-TW1BVM24YT"
    : STAGE_NAME === "stg"
      ? "G-Q7K53RM4VC"
      : "G-85QSG3WH5F";
