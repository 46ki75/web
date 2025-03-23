import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { stageName } from "../../bin/app";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface ApigwStackProps extends cdk.NestedStackProps {
  lambdaAlias: lambda.Alias;
}

export class ApigwStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: ApigwStackProps) {
    super(scope, id, props);

    const integration = new HttpLambdaIntegration(
      `${stageName}-46ki75-web-apigw-integration-api_lambda`,
      props.lambdaAlias,
      {
        timeout: cdk.Duration.seconds(15),
      }
    );

    new apigwv2.HttpApi(this, `${stageName}-46ki75-web-apigw-http-api`, {
      apiName: `${stageName}-46ki75-web-apigw-http-api`,
      defaultIntegration: integration,
    });
  }
}
