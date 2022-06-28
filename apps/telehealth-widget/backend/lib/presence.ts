import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface PresenceProps {
  appInstanceUserId: string;
}

export class Presence extends Construct {
  readonly functionArn: string;

  constructor(scope: Construct, id: string, props: PresenceProps) {
    super(scope, id);
    const { appInstanceUserId } = props;
    const appInstanceArn = `arn:aws:chime:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:app-instance/*`;
    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        LambdaChannelPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:ChannelFlowCallback', 'chime:DescribeChannel', 'chime:UpdateChannel'],
              resources: [appInstanceArn],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      maxSessionDuration: cdk.Duration.seconds(3600),
      path: '/',
    });
    const handler = new lambdaNodeJs.NodejsFunction(this, 'ProcessCustomPresenceFunction', {
      entry: './lambda/src/process-presence.ts',
      environment: { APP_INSTANCE_ADMIN_USER_ID: appInstanceUserId },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      tracing: lambda.Tracing.PASS_THROUGH,
      timeout: cdk.Duration.seconds(30),
    });
    handler.addPermission('ProcessCustomPresenceFunctionPermission', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('messaging.chime.amazonaws.com'),
      sourceAccount: cdk.Stack.of(this).account,
      sourceArn: appInstanceArn,
    });
    this.functionArn = handler.functionArn;
  }
}
