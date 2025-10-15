import { version } from "./package.json";
import { ENDPOINT, STAGE_NAME } from "./scripts/config";

export default defineAppConfig({
  SITE_NAME: "SrcJar",
  APPLICATION_VERSION: version,
  AWS_PRIMARY_REGION: "ap-northeast-1",
  AWS_GLOBAL_REGION: "us-east-1",
  ENDPOINT,
  STAGE_NAME,
});
