import { AwsRum } from "aws-rum-web";

export default defineNuxtPlugin(async () => {
  const appConfig = useAppConfig();
  const runtimeConfig = useRuntimeConfig();

  const APPLICATION_ID = runtimeConfig.public.RUM_APP_MONITOR_ID;
  const APPLICATION_VERSION = appConfig.APPLICATION_VERSION;
  const APPLICATION_REGION = "ap-northeast-1";

  const _awsRum: AwsRum = new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    {
      sessionSampleRate: 1,
      endpoint: "https://dataplane.rum.ap-northeast-1.amazonaws.com",
      telemetries: ["performance", "errors", "http"],
      identityPoolId: runtimeConfig.public.RUM_IDPOOL_ID,
      allowCookies: false,
      enableXRay: false,
    }
  );
});
