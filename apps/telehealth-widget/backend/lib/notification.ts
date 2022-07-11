import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface NotificationProps {
  appInstanceArn: string;
  appInstanceAdminArn: string;
}

export class Notification extends Construct {
  readonly stateMachineArn: string;
  readonly pinpointApplicationId: string;

  constructor(scope: Construct, id: string, private props: NotificationProps) {
    super(scope, id);
    const app = this.createPinpoint();
    this.pinpointApplicationId = app.ref;

    const stateMachine = this.createStateMachine(app.ref);
    this.stateMachineArn = stateMachine.stateMachineArn;

    // The stack cannot be deleted when Step Function executions are running.
    //
    // CloudFormation sends lifecycle events (e.g., DELETE) to the custom resource provider.
    // When receiving the DELETE event, the provider stops all running executions of the
    // Step Function state machine.
    this.createCustomResource(this.stateMachineArn);
  }

  private createPinpoint = (): pinpoint.CfnApp => {
    const app = new pinpoint.CfnApp(this, 'App', {
      name: cdk.Stack.of(this).stackName,
    });
    new pinpoint.CfnSMSChannel(this, 'SmsChannel', {
      applicationId: app.ref,
      enabled: true,
    });
    return app;
  };

  private createStateMachine = (applicationId: string): sfn.StateMachine => {
    const wait = new sfn.Wait(this, 'Wait', {
      time: sfn.WaitTime.timestampPath(`$.timestamp`),
    });
    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        MessagingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DescribeChannel'],
              resources: [`${this.props.appInstanceArn}/user/*`, `${this.props.appInstanceArn}/channel/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        PinpointPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['mobiletargeting:SendMessages'],
              resources: [
                `arn:aws:mobiletargeting:${cdk.Stack.of(this).region}:${
                  cdk.Stack.of(this).account
                }:apps/${applicationId}/messages`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
    const handler = new lambdaNodeJs.NodejsFunction(this, 'SendSmsMessageFunction', {
      entry: './lambda/src/send-sms-message.ts',
      environment: {
        APP_INSTANCE_ADMIN_ARN: this.props.appInstanceAdminArn,
        PINPOINT_APPLICATION_ID: applicationId,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
    const job = new tasks.LambdaInvoke(this, 'SendSmsMessageJob', {
      lambdaFunction: handler,
    });
    const definition = wait.next(job);
    const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      logs: {
        destination: new logs.LogGroup(this, 'NotificationStateMachineLogGroup'),
        level: sfn.LogLevel.ALL,
      },
    });
    stateMachine.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    return stateMachine;
  };

  private createCustomResource = (stateMachineArn: string) => {
    const role = new iam.Role(this, 'CustomResourceFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        StepFunctionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['states:ListExecutions', 'states:StopExecution'],
              resources: ['arn:aws:states:*:*:*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
    const handler = new lambdaNodeJs.NodejsFunction(this, 'DeleteSfnExecutions', {
      entry: './lambda/src/delete-sfn-executions.ts',
      environment: {
        STATE_MACHINE_ARN: stateMachineArn,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.minutes(15),
    });
    const provider = new cdk.custom_resources.Provider(this, 'Provider', {
      onEventHandler: handler,
    });
    new cdk.CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
    });
  };
}
