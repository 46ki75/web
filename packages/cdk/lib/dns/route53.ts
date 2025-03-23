import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import { stageName } from "../../bin/app";

export class Route53Stack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const ZONE_NAME =
      stageName === "prod"
        ? "www.46ki75.com"
        : stageName === "dev" || stageName === "stg"
        ? `${stageName}-www.46ki75.com`
        : undefined;

    if (ZONE_NAME == null) {
      throw new Error("ZONE_NAME is undefined.");
    }

    const hostZone = new route53.HostedZone(
      this,
      `${stageName}-46ki75-web-route53-public_host_zone-main`,
      {
        zoneName: ZONE_NAME,
      }
    );
  }
}
