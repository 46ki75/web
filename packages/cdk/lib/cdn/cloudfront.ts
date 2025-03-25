import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import { STAGE_NAME, ZONE_NAME } from "../../bin/app";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

interface CloudfrontStackProps extends cdk.NestedStackProps {
  bucket: s3.Bucket;
  certificate: Certificate;
}

export class CloudfrontStack extends cdk.NestedStack {
  readonly distribution: cloudfront.Distribution;
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props);

    this.distribution = new cloudfront.Distribution(
      this,
      `${STAGE_NAME}-46ki75-web-cloudfront-distribution-main`,
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withBucketDefaults(props.bucket),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        },
        certificate: props.certificate,
        domainNames: [ZONE_NAME],
      }
    );

    new cloudfront.S3OriginAccessControl(
      this,
      `${STAGE_NAME}-46ki75-web-cloudfront-oac-web`,
      {
        originAccessControlName: `${STAGE_NAME}-46ki75-web-cloudfront-oac-web`,
      }
    );
  }
}
