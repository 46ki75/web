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

    const bucket = new s3.Bucket(
      this,
      `${STAGE_NAME}-46ki75-web-s3-bucket-web`,
      {
        bucketName: `${STAGE_NAME}-46ki75-web-s3-bucket-web`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // const oac = new cloudfront.S3OriginAccessControl(
    //   this,
    //   `${STAGE_NAME}-46ki75-web-cloudfront-oac-web`,
    //   {
    //     originAccessControlName: `${STAGE_NAME}-46ki75-web-cloudfront-oac-web`,
    //   }
    // );

    this.distribution = new cloudfront.Distribution(
      this,
      `${STAGE_NAME}-46ki75-web-cloudfront-distribution-main`,
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(bucket),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        },
        certificate: props.certificate,
        domainNames: [ZONE_NAME],
        defaultRootObject: "index.html",
      }
    );
  }
}
