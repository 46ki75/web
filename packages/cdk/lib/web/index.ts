import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Stack } from "./s3";
import { STAGE_NAME } from "../../bin/app";
import * as s3 from "aws-cdk-lib/aws-s3";

export class WebStack extends cdk.Stack {
  readonly bucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Stack = new S3Stack(
      this,
      `${STAGE_NAME}-46ki75-web-cloudformation-stack-web_s3`
    );

    this.bucket = s3Stack.bucket;
  }
}
