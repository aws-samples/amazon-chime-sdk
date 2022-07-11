import {
  ChimeSDKIdentityClient,
  CreateAppInstanceCommand,
  CreateAppInstanceUserCommand,
  CreateAppInstanceAdminCommand,
} from '@aws-sdk/client-chime-sdk-identity';
import {
  ChimeSDKMessagingClient,
  CreateChannelFlowCommand,
  FallbackAction,
  InvocationType,
} from '@aws-sdk/client-chime-sdk-messaging';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const { AWS_REGION, APP_INSTANCE_USER_ID, PRESENCE_PROCESSOR_LAMBDA_ARN, STACK_NAME } = process.env;
const identityClient = new ChimeSDKIdentityClient({ region: AWS_REGION });
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });

exports.handler = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Create') {
    try {
      const appInstanceData = await identityClient.send(
        new CreateAppInstanceCommand({
          Name: `${STACK_NAME}-${uuidv4()}`,
        })
      );
      const appInstanceUserData = await identityClient.send(
        new CreateAppInstanceUserCommand({
          AppInstanceArn: appInstanceData.AppInstanceArn,
          AppInstanceUserId: APP_INSTANCE_USER_ID,
          ClientRequestToken: uuidv4(),
          Name: APP_INSTANCE_USER_ID,
        })
      );
      const appInstanceAdminData = await identityClient.send(
        new CreateAppInstanceAdminCommand({
          AppInstanceArn: appInstanceData.AppInstanceArn,
          AppInstanceAdminArn: appInstanceUserData.AppInstanceUserArn,
        })
      );
      const channelFlowData = await messagingClient.send(
        new CreateChannelFlowCommand({
          Name: 'Presence Channel Flow',
          ClientRequestToken: `CreateChannelFlow-${uuidv4()}`,
          AppInstanceArn: appInstanceData.AppInstanceArn,
          Processors: [
            {
              ExecutionOrder: 1,
              Name: 'PresenceProcessor',
              FallbackAction: FallbackAction.ABORT,
              Configuration: {
                Lambda: {
                  ResourceArn: PRESENCE_PROCESSOR_LAMBDA_ARN,
                  InvocationType: InvocationType.ASYNC,
                },
              },
            },
          ],
        })
      );
      return {
        Data: {
          AppInstanceArn: appInstanceData.AppInstanceArn,
          AppInstanceAdminArn: appInstanceAdminData.AppInstanceAdmin?.Arn,
          ChannelFlowArn: channelFlowData.ChannelFlowArn,
        },
      };
    } catch (error: any) {
      console.warn(`Failed to create: `, error);
      throw new Error(`Failed to create: ${error?.message}`);
    }
  } else {
    // Update or Delete
    return {};
  }
};
