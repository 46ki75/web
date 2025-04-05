import { version } from "./package.json";
import { ENDPOINT, STAGE_NAME } from "./scripts/fetchConfig";

export default defineAppConfig({
  APPLICATION_VERSION: version,
  AWS_PRIMARY_REGION: "ap-northeast-1",
  AWS_GLOBAL_REGION: "us-east-1",
  ENDPOINT,
  STAGE_NAME,
});
