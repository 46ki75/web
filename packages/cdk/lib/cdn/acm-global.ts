import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { STAGE_NAME, ZONE_NAME } from "../../bin/app";

export class AcmGlobalStack extends cdk.NestedStack {
  readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `${STAGE_NAME}-46ki75-web-route53-publichostedzone-main`,
      {
        domainName: ZONE_NAME,
      }
    );

    this.certificate = new acm.Certificate(
      this,
      `${STAGE_NAME}-46ki75-web-acm-stack-certificate-cloudfront`,
      {
        domainName: "dev-www.46ki75.com",
        certificateName: `${STAGE_NAME}-46ki75-web-acm-stack-certificate-cloudfront`,
        validation: {
          method: acm.ValidationMethod.DNS,
          props: {
            hostedZone,
            method: acm.ValidationMethod.DNS,
          },
        },
      }
    );

    new cdk.CfnOutput(this, "DomainName", { value: ZONE_NAME });
  }
}
