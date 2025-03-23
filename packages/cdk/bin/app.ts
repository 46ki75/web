#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api";
import { Route53Stack } from "../lib/dns/route53";
import { DnsStack } from "../lib/dns";

const app = new cdk.App();

export const stageName = app.node.tryGetContext("stageName");
if (!["dev", "stg", "prod"].some((n) => n === stageName)) {
  throw new Error(
    `Invalid stage name. Expected one of: 'dev', 'stg', or 'prod'.
    
        $ cdk command --context stageName=dev
    `
  );
}

new ApiStack(app, `${stageName}-46ki75-web-cloudformation-stack-api`);

new DnsStack(app, `${stageName}-46ki75-web-cloudformation-stack-dns`);
