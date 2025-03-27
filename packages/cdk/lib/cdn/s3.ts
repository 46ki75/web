import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { STAGE_NAME } from "../../bin/app";

export class S3Stack extends cdk.NestedStack {
  readonly bucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(
      this,
      `${STAGE_NAME}-46ki75-web-s3-bucket-web`,
      {
        bucketName: `${STAGE_NAME}-46ki75-web-s3-bucket-web`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
  }
}
