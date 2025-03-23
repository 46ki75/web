import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda";
import { stageName } from "../../bin/app";
import { ApigwStack } from "./apigw";
import { IamStack } from "./iam";
import { CloudWatchLogsStack } from "./cloudwatch-logs";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudWatchLogsStack = new CloudWatchLogsStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api_cloudwatchlogs`
    );

    const iamStack = new IamStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api_iam`
    );

    const lambdaStack = new LambdaStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api_lambda`,
      {
        lambdaRole: iamStack.lambdaRole,
        lambdaLogGroup: cloudWatchLogsStack.lambdaLogGroup,
      }
    );

    new ApigwStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api_apigw`,
      {
        lambdaAlias: lambdaStack.lambdaAlias,
      }
    );
  }
}
