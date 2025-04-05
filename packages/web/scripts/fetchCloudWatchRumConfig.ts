import { ENDPOINT } from "./fetchConfig";

export const fetchCloudWatchRumConfig = async () => {
  const response = await fetch(`${ENDPOINT}/api/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: /* GraphQL */ `
        query WebConfig {
          webConfig {
            rumIdentityPoolId
            rumAppMonitorId
          }
        }
      `,
    }),
  });

  const {
    data,
  }: {
    data: { webConfig: { rumIdentityPoolId: string; rumAppMonitorId: string } };
  } = await response.json();

  const { rumIdentityPoolId, rumAppMonitorId } = data.webConfig;

  return {
    RUM_IDPOOL_ID: rumIdentityPoolId,
    RUM_APP_MONITOR_ID: rumAppMonitorId,
  };
};
