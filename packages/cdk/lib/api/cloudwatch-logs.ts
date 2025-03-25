import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as logs from "aws-cdk-lib/aws-logs";
import { STAGE_NAME } from "../../bin/app";

export class CloudWatchLogsStack extends cdk.NestedStack {
  readonly lambdaLogGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.lambdaLogGroup = new logs.LogGroup(
      this,
      `${STAGE_NAME}-46ki75-web-cloudwatch-log_group-lambda_http_api`,
      {
        logGroupName: `/${STAGE_NAME}/46ki75/web/cloudwatch/log_group/lambda_http_api`,
        retention: logs.RetentionDays.TWO_WEEKS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
  }
}
