import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda";
import { stageName } from "../../bin/app";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaStack = new LambdaStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api_lambda`
    );
  }
}
