export const STAGE_NAME = process.env.STAGE_NAME ?? "dev";

if (!["dev", "stg", "prod"].includes(STAGE_NAME)) {
  throw new Error("STAGE_NAME is not valid.");
}

export const ENDPOINT =
  STAGE_NAME === "prod"
    ? `https://www.46ki75.com`
    : `https://${STAGE_NAME}-www.46ki75.com`;

export const GTAG =
  STAGE_NAME === "prod"
    ? "G-TW1BVM24YT"
    : STAGE_NAME === "stg"
    ? "G-Q7K53RM4VC"
    : "G-85QSG3WH5F";
