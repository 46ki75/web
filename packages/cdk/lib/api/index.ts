import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const stageName = this.node.tryGetContext("stageName");

    new cdk.CfnOutput(this, "STAGE_NAME", { value: stageName });
  }
}
