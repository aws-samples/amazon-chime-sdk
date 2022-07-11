import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface MeetingProps {
  appInstanceArn: string;
  appInstanceAdminArn: string;
}

export class Meeting extends Construct {
  readonly createMeetingFunctionArn: string;
  readonly createAttendeeFunctionArn: string;

  constructor(scope: Construct, id: string, private props: MeetingProps) {
    super(scope, id);

    const createMeetingHandler = this.createCreateMeetingLambda(this.createMeetingLambdaRole());
    this.createMeetingFunctionArn = createMeetingHandler.functionArn;

    const createAttendeeHandler = this.createCreateAttendeeLambda(this.createAttendeeLambdaRole());
    this.createAttendeeFunctionArn = createAttendeeHandler.functionArn;
  }

  private createMeetingLambdaRole = (): iam.Role => {
    return new iam.Role(this, 'CreateMeetingLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AppInstanceChannelPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DescribeChannel', 'chime:DescribeChannelMembership'],
              resources: [`${this.props.appInstanceArn}/user/*`, `${this.props.appInstanceArn}/channel/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        MeetingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateMeetingWithAttendees'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
  };

  private createAttendeeLambdaRole = (): iam.Role => {
    return new iam.Role(this, 'CreateAttendeeLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AppInstanceChannelPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DescribeChannel', 'chime:DescribeChannelMembership'],
              resources: [`${this.props.appInstanceArn}/user/*`, `${this.props.appInstanceArn}/channel/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        MeetingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateAttendee', 'chime:GetMeeting'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
  };

  /**
   *
   * Lambda handlers.
   */

  private createCreateMeetingLambda = (role: iam.Role): lambdaNodeJs.NodejsFunction => {
    const handler = new lambdaNodeJs.NodejsFunction(this, 'CreateMeetingFunction', {
      entry: './lambda/src/create-meeting.ts',
      environment: {
        APP_INSTANCE_ARN: this.props.appInstanceArn,
        APP_INSTANCE_ADMIN_ARN: this.props.appInstanceAdminArn,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
    return handler;
  };

  private createCreateAttendeeLambda = (role: iam.Role): lambdaNodeJs.NodejsFunction => {
    const handler = new lambdaNodeJs.NodejsFunction(this, 'CreateAttendeeFunction', {
      entry: './lambda/src/create-attendee.ts',
      environment: {
        APP_INSTANCE_ARN: this.props.appInstanceArn,
        APP_INSTANCE_ADMIN_ARN: this.props.appInstanceAdminArn,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
    return handler;
  };
}
