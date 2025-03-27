import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";

interface WebBucketPolicyStackProps extends cdk.StackProps {
  bucket: s3.Bucket;
  distribution: Distribution;
}

export class WebBucketPolicyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebBucketPolicyStackProps) {
    super(scope, id, props);

    props.bucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:GetObject"],
        resources: [`${props.bucket.bucketArn}/*`],
        conditions: [
          {
            StringEquals: {
              "AWS:SourceArn": props.distribution.distributionArn,
            },
          },
        ],
      })
    );
  }
}
