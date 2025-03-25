import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { STAGE_NAME } from "../../bin/app";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

interface ApigwStackProps extends cdk.NestedStackProps {
  lambdaAlias: lambda.Alias;
  certificate: acm.Certificate;
}

export class ApigwStack extends cdk.NestedStack {
  readonly domainName: apigwv2.DomainName;

  constructor(scope: Construct, id: string, props: ApigwStackProps) {
    super(scope, id, props);

    const apiDomain =
      STAGE_NAME === "prod"
        ? "api.www.46ki75.com"
        : `api.${STAGE_NAME}-www.46ki75.com`;

    const integration = new HttpLambdaIntegration(
      `${STAGE_NAME}-46ki75-web-apigw-integration-api_lambda`,
      props.lambdaAlias,
      {
        timeout: cdk.Duration.seconds(15),
      }
    );

    this.domainName = new apigwv2.DomainName(
      this,
      `${STAGE_NAME}-46ki75-web-apigw-domainName-api`,
      {
        certificate: props.certificate,
        domainName: apiDomain,
      }
    );

    new apigwv2.HttpApi(this, `${STAGE_NAME}-46ki75-web-apigw-http-api`, {
      apiName: `${STAGE_NAME}-46ki75-web-apigw-http-api`,
      defaultIntegration: integration,
      defaultDomainMapping: {
        domainName: this.domainName,
      },
    });
  }
}
