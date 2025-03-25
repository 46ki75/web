import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CloudfrontStack } from "./cloudfront";
import { STAGE_NAME } from "../../bin/app";
import * as s3 from "aws-cdk-lib/aws-s3";
import { AcmStack } from "../api/acm";

interface CdnStackProps extends cdk.StackProps {
  bucket: s3.Bucket;
}

export class CdnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdnStackProps) {
    super(scope, id, props);

    const certificateStack = new AcmStack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-web_acm`
    );

    const s3Stack = new CloudfrontStack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-cdn_cloudfront`,
      {
        bucket: props.bucket,
        certificate: certificateStack.certificate,
      }
    );
  }
}
