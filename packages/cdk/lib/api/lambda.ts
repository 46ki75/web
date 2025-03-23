import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { stageName } from "../../bin/app";

export class LambdaStack extends cdk.NestedStack {
  readonly lambdaAlias: lambda.Alias;
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(
      this,
      `${stageName}-46ki75-web-lambda-function-api`,
      {
        functionName: `${stageName}-46ki75-web-lambda-function-api`,
        code: lambda.Code.fromAsset("../../target/lambda/http-api/"),
        handler: "DOES_NOT_MATTER",
        runtime: lambda.Runtime.PROVIDED_AL2023,
        architecture: lambda.Architecture.X86_64,
        memorySize: 128,
        timeout: cdk.Duration.seconds(15),
      }
    );

    const lambdaVersion = new lambda.Version(
      this,
      `${stageName}-46ki75-web-lambda-version-api`,
      {
        lambda: lambdaFunction,
      }
    );

    this.lambdaAlias = new lambda.Alias(
      this,
      `${stageName}-46ki75-web-lambda-alias-api_stable`,
      {
        aliasName: "stable",
        version: lambdaVersion,
      }
    );
  }
}
