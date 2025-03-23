import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { stageName } from "../../bin/app";

interface AcmStackProps extends cdk.NestedStackProps {
  hostedZone: route53.IHostedZone;
}

export class AcmStack extends cdk.NestedStack {
  readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: AcmStackProps) {
    super(scope, id, props);

    const ZONE_NAME =
      stageName === "prod" ? "www.46ki75.com" : `${stageName}-www.46ki75.com`;

    this.certificate = new acm.Certificate(
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
