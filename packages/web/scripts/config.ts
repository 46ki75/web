import { client } from "../openapi/client";

export const fetchCloudWatchRumConfig = async () => {
  const { data } = await client.GET("/api/v2/web-config");

  if (data == null) {
    throw new Error("Faild to fetch web config.");
  }

  return {
    RUM_IDPOOL_ID: data.rum_identity_pool_id,
    RUM_APP_MONITOR_ID: data.rum_app_monitor_id,
  };
};

export const STAGE_NAME = process.env.STAGE_NAME ?? "dev";

if (!["dev", "stg", "prod"].includes(STAGE_NAME)) {
  throw new Error("STAGE_NAME is not valid.");
}

export const ENDPOINT =
  STAGE_NAME === "prod"
    ? `https://www.ikuma.cloud`
    : `https://${STAGE_NAME}-www.ikuma.cloud`;

export const GTAG =
  STAGE_NAME === "prod"
    ? "G-TW1BVM24YT"
    : STAGE_NAME === "stg"
    ? "G-Q7K53RM4VC"
    : "G-85QSG3WH5F";
