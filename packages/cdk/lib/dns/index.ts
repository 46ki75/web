import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { stageName } from "../../bin/app";
import { Route53Stack } from "./route53";

export class DnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Route53Stack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-route53`
    );
  }
}
