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
