import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { Presence } from './presence';

export interface MessagingProps {}

/**
 * Chime SDK messaging and identity
 */
export class Messaging extends Construct {
  readonly appInstanceArn: string;
  readonly appInstanceAdminArn: string;
  readonly channelFlowArn: string;

  constructor(scope: Construct, id: string, private props: MessagingProps) {
    super(scope, id);
    const appInstanceUserId = 'admin';
    const presence = new Presence(this, 'Presence', {
      appInstanceUserId,
    });

    // Create an AppInstance and an AppInstanceAdmin when creating a stack.
    // How? CloudFormation sends lifecycle events (e.g., CREATE) to the custom resource provider:
    // CreateAppInstanceFunction.
    const role = this.createRole();
    const { appInstanceArn, appInstanceAdminArn, channelFlowArn } = this.createAppInstanceCustomResource(
      role,
      appInstanceUserId,
      presence
    );
    this.createDeleteAppInstanceCustomResource(appInstanceArn);
    this.appInstanceArn = appInstanceArn;
    this.appInstanceAdminArn = appInstanceAdminArn;
    this.channelFlowArn = channelFlowArn;
  }

  private createRole = (): iam.Role => {
    return new iam.Role(this, 'AppInstanceCreationLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AppInstancePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateAppInstance', 'chime:CreateAppInstanceAdmin', 'chime:CreateAppInstanceUser'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        CreateChannelFlowPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateChannelFlow'],
              resources: [`arn:aws:chime:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:app-instance/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
  };

  private createAppInstanceCustomResource = (
    role: iam.Role,
    appInstanceUserId: string,
    presence: Presence
  ): {
    appInstanceArn: string;
    appInstanceAdminArn: string;
    channelFlowArn: string;
  } => {
    const handler = new lambdaNodeJs.NodejsFunction(this, 'CreateAppInstanceFunction', {
      entry: './lambda/src/create-app-instance.ts',
      environment: {
        APP_INSTANCE_USER_ID: appInstanceUserId,
        PRESENCE_PROCESSOR_LAMBDA_ARN: presence.functionArn,
        STACK_NAME: cdk.Stack.of(this).stackName,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
    const provider = new cdk.custom_resources.Provider(this, 'CreateAppInstanceProvider', {
      onEventHandler: handler,
    });
    const customResource = new cdk.CustomResource(this, 'CreateAppInstanceCustomResource', {
      serviceToken: provider.serviceToken,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    return {
      appInstanceArn: customResource.getAtt('AppInstanceArn').toString(),
      appInstanceAdminArn: customResource.getAtt('AppInstanceAdminArn').toString(),
      channelFlowArn: customResource.getAtt('ChannelFlowArn').toString(),
    };
  };

  private createDeleteAppInstanceRole = (appInstanceArn: string): iam.Role => {
    return new iam.Role(this, 'AppInstanceDeletionLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AppInstancePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DeleteAppInstance', 'chime:DescribeAppInstance'],
              resources: [appInstanceArn],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
  };

  /**
   * Create a new provider and a custom resource so that we can use the AppInstanceArn on 'Delete' lifecycle event.
   * Adding AppInstanceArn as an enviroment variable on the existing custom resource provider lambda handler runs into
   * ValidationError due to circular dependency.
   *
   * We need AppInstanceArn to delete the AppInstance when cdk destroys the deployed stack as part of clean up.
   * A better way to create AppInstance, AppInstanceUser would be to use AwsCustomResource so that we get PhysicalResouceId for each and then it is easy to delete them.
   * Reference: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.custom_resources-readme.html#custom-resources-for-aws-apis
   */
  private createDeleteAppInstanceCustomResource = (appInstanceArn: string): void => {
    const role = this.createDeleteAppInstanceRole(appInstanceArn);
    const deleteAppInstanceLambdaFunctionHandler = new lambdaNodeJs.NodejsFunction(this, 'DeleteAppInstanceFunction', {
      entry: './lambda/src/delete-app-instance.ts',
      environment: {
        APP_INSTANCE_ARN: appInstanceArn,
        STACK_NAME: cdk.Stack.of(this).stackName,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
    const provider = new cdk.custom_resources.Provider(this, 'DeleteAppInstanceProvider', {
      onEventHandler: deleteAppInstanceLambdaFunctionHandler,
    });
    new cdk.CustomResource(this, 'DeleteAppInstanceCustomResource', {
      serviceToken: provider.serviceToken,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  };
}
