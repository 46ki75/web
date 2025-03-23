import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { stageName } from "../../bin/app";
import { Route53Stack } from "./route53";
import { AcmStack } from "./acm";

export class DnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const route53Stack = new Route53Stack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-dns_route53`
    );

    const acmStack = new AcmStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-dns_acm`,
      {
        hostedZone: route53Stack.hostedZone,
      }
    );
  }
}
