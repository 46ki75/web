import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as target from "aws-cdk-lib/aws-route53-targets";
import { STAGE_NAME } from "../../bin/app";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

interface Route53RecordStackProps extends cdk.NestedStackProps {
  domainName: apigwv2.DomainName;
}

export class Route53Stack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: Route53RecordStackProps) {
    super(scope, id, props);

    const ZONE_NAME =
      STAGE_NAME === "prod"
        ? "www.46ki75.com"
        : STAGE_NAME === "dev" || STAGE_NAME === "stg"
        ? `${STAGE_NAME}-www.46ki75.com`
        : undefined;

    if (ZONE_NAME == null) {
      throw new Error("ZONE_NAME is undefined.");
    }

    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `${STAGE_NAME}-46ki75-web-route53-publichostedzone-main`,
      {
        domainName: ZONE_NAME,
      }
    );

    new route53.ARecord(this, `${STAGE_NAME}-46ki75-web-route53-record-api`, {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new target.ApiGatewayv2DomainProperties(
          props.domainName.regionalDomainName,
          props.domainName.regionalHostedZoneId
        )
      ),
      recordName: "api",
    });
  }
}
