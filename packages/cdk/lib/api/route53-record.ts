import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as target from "aws-cdk-lib/aws-route53-targets";
import { stageName } from "../../bin/app";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

interface Route53RecordStackProps extends cdk.NestedStackProps {
  domainName: apigwv2.DomainName;
}

export class Route53RecordStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: Route53RecordStackProps) {
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

    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `${stageName}-46ki75-web-route53-publichostedzone-main`,
      {
        domainName: ZONE_NAME,
      }
    );

    new route53.ARecord(this, `${stageName}-46ki75-web-route53-record-api`, {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new target.ApiGatewayv2DomainProperties(
          props.domainName.regionalDomainName,
          props.domainName.regionalHostedZoneId
        )
      ),
    });
  }
}
