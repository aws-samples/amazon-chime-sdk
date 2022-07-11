import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * The Appointment construct provides APIs to create and delete appointments
 * using the Chime SDK messaging, Cognito, and Step Function.
 */
export interface AppointmentProps {
  appInstanceArn: string;
  channelFlowArn: string;
  cognitoUserPoolId: string;
  stateMachineArn: string;
}

export class Appointment extends Construct {
  readonly createAppointmentFunctionArn: string;
  readonly deleteAppointmentFunctionArn: string;

  constructor(scope: Construct, id: string, private props: AppointmentProps) {
    super(scope, id);
    const createAppointmentFunction = this.createCreateAppointmentFunction();
    this.createAppointmentFunctionArn = createAppointmentFunction.functionArn;

    const deleteAppointmentFunction = this.createDeleteAppointmentFunction();
    this.deleteAppointmentFunctionArn = deleteAppointmentFunction.functionArn;
  }

  private createCreateAppointmentFunction = (): lambda.Function => {
    const role = new iam.Role(this, 'CreateAppointmentFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        MessagingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'chime:AssociateChannelFlow',
                'chime:BatchCreateChannelMembership',
                'chime:CreateChannel',
                'chime:CreateChannelModerator',
                'chime:DeleteChannel',
                'chime:DescribeChannel',
                'chime:UpdateChannel',
              ],
              resources: [
                `${this.props.appInstanceArn}/user/*`,
                `${this.props.appInstanceArn}/channel/*`,
                `${this.props.appInstanceArn}/channel-flow/*`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        CognitoPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['cognito-idp:AdminGetUser'],
              resources: [
                `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/${
                  this.props.cognitoUserPoolId
                }`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        StepFunctionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['states:StartExecution', 'states:StopExecution'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    return new lambdaNodeJs.NodejsFunction(this, 'CreateAppointmentFunction', {
      entry: './lambda/src/create-appointment.ts',
      environment: {
        APP_INSTANCE_ARN: this.props.appInstanceArn,
        CHANNEL_FLOW_ARN: this.props.channelFlowArn,
        COGNITO_USER_POOL_ID: this.props.cognitoUserPoolId,
        STATE_MACHINE_ARN: this.props.stateMachineArn,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
  };

  private createDeleteAppointmentFunction = (): lambda.Function => {
    const role = new iam.Role(this, 'DeleteAppointmentFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        MessagingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DeleteChannel', 'chime:DescribeChannel'],
              resources: [
                `${this.props.appInstanceArn}/user/*`,
                `${this.props.appInstanceArn}/channel/*`,
                `${this.props.appInstanceArn}/channel-flow/*`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        StepFunctionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['states:StopExecution'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    return new lambdaNodeJs.NodejsFunction(this, 'DeleteAppointmentFunction', {
      entry: './lambda/src/delete-appointment.ts',
      environment: {
        APP_INSTANCE_ARN: this.props.appInstanceArn,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
  };
}
