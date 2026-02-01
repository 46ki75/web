import { version } from "./package.json";

export default defineAppConfig({
  SITE_NAME: "SrcJar",
  APPLICATION_VERSION: version,
  AWS_PRIMARY_REGION: "ap-northeast-1",
  AWS_GLOBAL_REGION: "us-east-1",
});
