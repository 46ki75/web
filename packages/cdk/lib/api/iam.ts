import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { STAGE_NAME } from "../../bin/app";

export class IamStack extends cdk.NestedStack {
  readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.lambdaRole = new iam.Role(
      this,
      `${STAGE_NAME}-46ki75-web-iam-role-lambda_api`,
      {
        roleName: `${STAGE_NAME}-46ki75-web-iam-role-lambda_api`,
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    const lambdaPolicy = new iam.Policy(
      this,
      `${STAGE_NAME}-46ki75-web-iam-policy-lambda_api`,
      {
        policyName: `${STAGE_NAME}-46ki75-web-iam-policy-lambda_api`,
        document: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["ssm:GetParameter"],
              resources: [
                `arn:aws:ssm:${this.region}:${this.account}:parameter/shared/46ki75/web/ssm/parameter/notion/database/id`,
                `arn:aws:ssm:${this.region}:${this.account}:parameter/${STAGE_NAME}/46ki75/web/ssm/parameter/notion/secret`,
              ],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: ["*"],
            }),
          ],
        }),
      }
    );

    lambdaPolicy.attachToRole(this.lambdaRole);
  }
}
