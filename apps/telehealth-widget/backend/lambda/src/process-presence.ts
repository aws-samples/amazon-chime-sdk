import {
  ChannelFlowCallbackCommand,
  ChimeSDKMessagingClient,
  DescribeChannelCommand,
  UpdateChannelCommand,
} from '@aws-sdk/client-chime-sdk-messaging';

// You can create a shared NPM package between the frontend and backend package to use
// common types, configurations, and utilities in a production environment.
import { ChannelMetadata, MessageMetadata, UpdateChannelMetadata } from '../../../frontend/src/types';

const { AWS_REGION, APP_INSTANCE_ADMIN_USER_ID } = process.env;
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });

exports.handler = async function (event: any) {
  let deleteResource: boolean = false;

  try {
    if (event.ChannelMessage.Metadata) {
      const metadata: MessageMetadata = JSON.parse(event.ChannelMessage.Metadata);
      if (metadata.presence) {
        const sender = event.ChannelMessage.Sender;
        const [AppInstanceArn, appInstanceUserId] = sender.Arn.split('/user/');

        // This processor Lambda function cannot take in an AppInstanceAdminArn as an environment
        // variable because of a circular dependency with the CreateAppInstanceFunction.
        // 1. The CreateAppInstanceFunction requires the processor function's ARN.
        // 2. The processor function requires the AppInstanceAdminArn from the CreateAppInstanceFunction.
        //
        // Instead, use the sender's ARN property to compute the admin ARN.
        const appInstanceAdminArn = `${AppInstanceArn}/user/${APP_INSTANCE_ADMIN_USER_ID!}`;

        const { Channel } = await messagingClient.send(
          new DescribeChannelCommand({
            ChannelArn: event.ChannelMessage.ChannelArn,
            ChimeBearer: appInstanceAdminArn,
          })
        );
        if (!Channel) {
          throw new Error(`Channel ARN ${event.ChannelMessage.ChannelArn} does not exist.`);
        }

        // Update channel metadata only when the presence value has changed.
        const channelMetadata: ChannelMetadata = JSON.parse(Channel.Metadata!);
        if (metadata.presence === channelMetadata.presenceMap[appInstanceUserId].presence) {
          // Also, delete the message that contains the same presence value as the previous one.
          deleteResource = true;
        } else {
          await messagingClient.send(
            new UpdateChannelCommand({
              ChannelArn: Channel.ChannelArn,
              Name: Channel.Name,
              Mode: Channel.Mode,
              Metadata: JSON.stringify({
                ...channelMetadata,
                clientId: metadata.clientId,
                presenceMap: {
                  ...channelMetadata.presenceMap,
                  [appInstanceUserId]: {
                    presence: metadata.presence,
                    modifiedTimestamp: new Date(),
                  },
                },
              } as UpdateChannelMetadata),
              ChimeBearer: appInstanceAdminArn,
            })
          );
        }
      }
    }
  } catch (error: any) {
    console.error(error);
  }

  try {
    await messagingClient.send(
      new ChannelFlowCallbackCommand({
        CallbackId: event.CallbackId,
        ChannelArn: event.ChannelMessage.ChannelArn,
        DeleteResource: deleteResource,
        ChannelMessage: {
          MessageId: event.ChannelMessage.MessageId,
          Content: event.ChannelMessage.Content,
          Metadata: event.ChannelMessage.Metadata,
        },
      })
    );
  } catch (error: any) {
    console.error(error);
  }
};
