import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Appointment } from './appointment';
import { Distribution } from './distribution';
import { Cognito } from './cognito';
import { Meeting } from './meeting';
import { Messaging } from './messaging';
import { Notification } from './notification';
import { PSTN } from './pstn';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const messaging = new Messaging(this, 'Messaging', {});
    const meeting = new Meeting(this, 'Meeting', {
      appInstanceArn: messaging.appInstanceArn,
      appInstanceAdminArn: messaging.appInstanceAdminArn,
    });
    const cognito = new Cognito(this, 'Cognito', {
      appInstanceArn: messaging.appInstanceArn,
      createMeetingFunctionArn: meeting.createMeetingFunctionArn,
      createAttendeeFunctionArn: meeting.createAttendeeFunctionArn,
    });
    const distribution = new Distribution(this, 'Distribution');
    const notification = new Notification(this, 'Notification', {
      appInstanceArn: messaging.appInstanceArn,
      appInstanceAdminArn: messaging.appInstanceAdminArn,
    });
    const appointment = new Appointment(this, 'Appointment', {
      appInstanceArn: messaging.appInstanceArn,
      channelFlowArn: messaging.channelFlowArn,
      cognitoUserPoolId: cognito.cognitoUserPoolId,
      stateMachineArn: notification.stateMachineArn,
    });
    const pstn = new PSTN(this, 'PSTN', {
      appInstanceArn: messaging.appInstanceArn,
      cognitoUserPoolId: cognito.cognitoUserPoolId,
    });

    // Create output values at the stack level to have an output name without prefix and postfix.
    // e.g., "AppInstanceArn" instead of "MessagingAppInstanceArn13E661EB" (construct + output + hash)
    const output = {
      AppInstanceArn: messaging.appInstanceArn,
      ChannelFlowArn: messaging.channelFlowArn,
      CognitoIdentityPoolId: cognito.cognitoIdentityPoolId,
      CognitoUserPoolClientId: cognito.cognitoUserPoolClientId,
      CognitoUserPoolId: cognito.cognitoUserPoolId,
      CreateAppointmentFunctionArn: appointment.createAppointmentFunctionArn,
      CreateAttendeeFunctionArn: meeting.createAttendeeFunctionArn,
      CreateMeetingFunctionArn: meeting.createMeetingFunctionArn,
      DeleteAppointmentFunctionArn: appointment.deleteAppointmentFunctionArn,
      DistributionBucketName: distribution.bucketName,
      DistributionId: distribution.id,
      DistributionUrl: distribution.url,
      DoctorUserPoolGroupName: cognito.doctorUserPoolGroupName,
      MakeOutboundCallFunctionArn: pstn.makeOutboundCallFunctionArn,
      PatientUserPoolGroupName: cognito.patientUserPoolGroupName,
      Region: cdk.Stack.of(this).region,
      StateMachineArn: notification.stateMachineArn,
    };
    for (const [key, value] of Object.entries(output)) {
      new cdk.CfnOutput(this, key, { value });
    }
  }
}
