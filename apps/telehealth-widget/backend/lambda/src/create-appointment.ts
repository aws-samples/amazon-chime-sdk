import {
  AssociateChannelFlowCommand,
  BatchCreateChannelMembershipCommand,
  ChannelMembershipType,
  ChannelMode,
  ChannelPrivacy,
  ChimeSDKMessagingClient,
  CreateChannelCommand,
  CreateChannelModeratorCommand,
  DeleteChannelCommand,
  UpdateChannelCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SFNClient, StartExecutionCommand, StopExecutionCommand } from '@aws-sdk/client-sfn';
import { v4 as uuidv4 } from 'uuid';

import { Presence } from '../../../frontend/src/constants';
import { ChannelMetadata, CognitoUser } from '../../../frontend/src/types';
import { CreateAppointmentFunctionEvent } from '../../../frontend/src/types/lambda';
import { getCognitoUser } from './utils';

const { APP_INSTANCE_ARN, AWS_REGION, CHANNEL_FLOW_ARN, COGNITO_USER_POOL_ID, STATE_MACHINE_ARN } = process.env;

const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });
const sfnClient = new SFNClient({ region: AWS_REGION });

exports.handler = async (event: CreateAppointmentFunctionEvent) => {
  const { doctorUsername, patientUsername } = event;
  const timestamp = new Date(event.timestamp);
  const appInstanceUserArn = `${APP_INSTANCE_ARN}/user/${doctorUsername}`;
  let channelArn: string | undefined = undefined;
  let executionArn: string | undefined = undefined;

  try {
    const [doctorData, patientData] = await Promise.all([
      cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: doctorUsername,
        })
      ),
      cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: patientUsername,
        })
      ),
    ]);

    const doctor: CognitoUser = getCognitoUser(doctorUsername, doctorData);
    const patient: CognitoUser = getCognitoUser(patientUsername, patientData);
    const metadata: ChannelMetadata = {
      appointmentTimestamp: timestamp,
      doctor: {
        username: doctor.username,
        name: doctor.attributes.name,
        email: doctor.attributes.email,
        phone: doctor.attributes.phone_number,
      },
      patient: {
        username: patient.username,
        name: patient.attributes.name,
        email: patient.attributes.email,
        phone: patient.attributes.phone_number,
      },
      presenceMap: {
        [doctor.username]: {
          presence: Presence.Added,
          modifiedTimestamp: timestamp,
        },
        [patient.username]: {
          presence: Presence.Added,
          modifiedTimestamp: timestamp,
        },
      },
    };
    const channelName = uuidv4();
    const data = await messagingClient.send(
      new CreateChannelCommand({
        AppInstanceArn: APP_INSTANCE_ARN,
        ChimeBearer: appInstanceUserArn,
        Name: channelName,
        Metadata: JSON.stringify(metadata),
        Mode: ChannelMode.RESTRICTED,
        Privacy: ChannelPrivacy.PUBLIC,
      })
    );
    channelArn = data.ChannelArn!;
    await messagingClient.send(
      new AssociateChannelFlowCommand({
        ChannelArn: channelArn,
        ChannelFlowArn: CHANNEL_FLOW_ARN,
        ChimeBearer: appInstanceUserArn,
      })
    );
    const patientArn = `${APP_INSTANCE_ARN}/user/${patient.username}`;
    await messagingClient.send(
      new BatchCreateChannelMembershipCommand({
        ChannelArn: channelArn,
        ChimeBearer: appInstanceUserArn,
        MemberArns: [appInstanceUserArn, patientArn],
        Type: ChannelMembershipType.DEFAULT,
      })
    );

    // Make a patient a channel moderator so that a patient can use the ListChannelsModeratedByAppInstanceUser API.
    // A patient still has limited permissions by Cognito PatientGroupRole (IAM Role).
    await messagingClient.send(
      new CreateChannelModeratorCommand({
        ChannelArn: channelArn,
        ChannelModeratorArn: patientArn,
        ChimeBearer: appInstanceUserArn,
      })
    );
    const executionData = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        input: JSON.stringify({
          timestamp: timestamp.toISOString(),
          channelArn: channelArn,
        }),
      })
    );
    executionArn = executionData.executionArn;
    await messagingClient.send(
      new UpdateChannelCommand({
        ChannelArn: channelArn,
        ChimeBearer: appInstanceUserArn,
        Name: channelName,
        Mode: ChannelMode.RESTRICTED,
        Metadata: JSON.stringify({
          ...metadata,
          sfnExecutionArn: executionData.executionArn,
        } as ChannelMetadata),
      })
    );
  } catch (error: any) {
    console.error(error);

    // Clean up failed resources
    try {
      if (channelArn) {
        console.error(`Deleting a channel (${channelArn})`);
        await messagingClient.send(
          new DeleteChannelCommand({
            ChannelArn: channelArn,
            ChimeBearer: appInstanceUserArn,
          })
        );
      }
    } catch (error: any) {
      console.error(error);
    }

    try {
      if (executionArn) {
        console.error(`Stopping an execution (${executionArn})`);
        await sfnClient.send(
          new StopExecutionCommand({
            executionArn,
          })
        );
      }
    } catch (error: any) {
      console.error(error);
    }
  }
};
