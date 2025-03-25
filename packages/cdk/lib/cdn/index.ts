import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudfrontStack } from "./cloudfront";
import { STAGE_NAME } from "../../bin/app";
import * as s3 from "aws-cdk-lib/aws-s3";
import { WebBucketPolicyStack } from "./web-bucket-policy";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { S3Stack } from "./s3";

interface CdnStackProps extends cdk.StackProps {
  certificate: Certificate;
}

export class CdnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdnStackProps) {
    super(scope, id, props);

    const s3Stack = new S3Stack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-cdn_s3`
    );

    const cloudfrontStack = new CloudfrontStack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-cdn_cloudfront`,
      {
        bucket: s3Stack.bucket,
        certificate: props.certificate,
      }
    );

    const webBucketPolicyStack = new WebBucketPolicyStack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-cdn_webBucketPolicyStack`,
      {
        env: {
          account: process.env.CDK_DEFAULT_ACCOUNT,
          region: process.env.CDK_DEFAULT_REGION,
        },
        crossRegionReferences: true,
        bucket: s3Stack.bucket,
        distribution: cloudfrontStack.distribution,
      }
    );
  }
}
