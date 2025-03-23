import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { stageName } from "../../bin/app";

interface AcmStackProps extends cdk.NestedStackProps {
  hostedZone: route53.HostedZone;
}

export class AcmStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: AcmStackProps) {
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

    new acm.Certificate(
      this,
      `${stageName}-46ki75-web-acm-stack-certificate-cloudfront`,
      {
        domainName: `${ZONE_NAME}`,
        certificateName: `${stageName}-46ki75-web-acm-stack-certificate-cloudfront`,
        validation: {
          method: acm.ValidationMethod.DNS,
          props: {
            hostedZone: props.hostedZone,
            method: acm.ValidationMethod.DNS,
          },
        },
      }
    );

    new acm.Certificate(
      this,
      `${stageName}-46ki75-web-acm-stack-certificate-api`,
      {
        domainName: `api.${ZONE_NAME}`,
        certificateName: `${stageName}-46ki75-web-acm-stack-certificate-api`,
        validation: {
          method: acm.ValidationMethod.DNS,
          props: {
            hostedZone: props.hostedZone,
            method: acm.ValidationMethod.DNS,
          },
        },
      }
    );
  }
}
