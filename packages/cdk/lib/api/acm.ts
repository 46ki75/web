import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { STAGE_NAME } from "../../bin/app";

export class AcmStack extends cdk.NestedStack {
  readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
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

    this.certificate = new acm.Certificate(
      this,
      `${STAGE_NAME}-46ki75-web-acm-stack-certificate-api`,
      {
        domainName: `api.${ZONE_NAME}`,
        certificateName: `${STAGE_NAME}-46ki75-web-acm-stack-certificate-api`,
        validation: {
          method: acm.ValidationMethod.DNS,
          props: {
            hostedZone,
            method: acm.ValidationMethod.DNS,
          },
        },
      }
    );
  }
}
