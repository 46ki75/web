import { AwsRum, type AwsRumConfig } from "aws-rum-web";

const config: AwsRumConfig = {
  sessionSampleRate: 1,
  endpoint: "https://dataplane.rum.ap-northeast-1.amazonaws.com",
  telemetries: ["performance", "errors", "http"],
  identityPoolId: "", // TODO: implement
  allowCookies: false,
  enableXRay: false,
};

const APPLICATION_ID: string = "uuid"; // TODO: implement
const APPLICATION_VERSION: string = "0.1.0";
const APPLICATION_REGION: string = "ap-northeast-1";

export default defineNuxtPlugin(() => {
  const _awsRum: AwsRum = new AwsRum(
    APPLICATION_ID,
    APPLICATION_VERSION,
    APPLICATION_REGION,
    config
  );
});
