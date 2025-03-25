#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api";
import { CdnStack } from "../lib/cdn";
import { AcmGlobalStack } from "../lib/acm-global";

const app = new cdk.App();

export const STAGE_NAME = app.node.tryGetContext("stageName");
if (!["dev", "stg", "prod"].some((n) => n === STAGE_NAME)) {
  throw new Error(
    `Invalid stage name. Expected one of: 'dev', 'stg', or 'prod'.
    
        $ cdk command --context stageName=dev
    `
  );
}

export const ZONE_NAME =
  STAGE_NAME === "prod" ? "www.46ki75.com" : `${STAGE_NAME}-www.46ki75.com`;

const apiStack = new ApiStack(
  app,
  `${STAGE_NAME}-46ki75-web-cloudformation-stack-api`,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  }
);

const acmGlobalStack = new AcmGlobalStack(
  app,
  `${STAGE_NAME}-46ki75-web-cloudformation-stack-acmGlobal`,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-east-1",
    },
  }
);

const cdnStack = new CdnStack(
  app,
  `${STAGE_NAME}-46ki75-web-cloudformation-stack-cdn`,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    crossRegionReferences: true,
    certificate: acmGlobalStack.certificate,
  }
);
