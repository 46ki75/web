import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda";
import { stageName } from "../../bin/app";
import { ApigwStack } from "./apigw";
import { IamStack } from "./iam";
import { CloudWatchLogsStack } from "./cloudwatch-logs";
import { Route53Stack } from "./route53";
import { AcmStack } from "./acm";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudWatchLogsStack = new CloudWatchLogsStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-cloudwatchlogs`
    );

    const iamStack = new IamStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-iam`
    );

    const lambdaStack = new LambdaStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-lambda`,
      {
        lambdaRole: iamStack.lambdaRole,
        lambdaLogGroup: cloudWatchLogsStack.lambdaLogGroup,
      }
    );

    const acmStack = new AcmStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-acm`
    );

    const apigwStack = new ApigwStack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-apigw`,
      {
        lambdaAlias: lambdaStack.lambdaAlias,
        certificate: acmStack.certificate,
      }
    );

    const route53RecordStack = new Route53Stack(
      this,
      `${stageName}-46ki75-web-cloudformation-stack-api-route53`,
      {
        domainName: apigwStack.domainName,
      }
    );
  }
}
