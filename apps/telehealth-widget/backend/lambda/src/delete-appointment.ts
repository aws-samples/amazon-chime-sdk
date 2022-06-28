import {
  ChimeSDKMessagingClient,
  DeleteChannelCommand,
  DescribeChannelCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { SFNClient, StopExecutionCommand } from '@aws-sdk/client-sfn';

import { ChannelMetadata } from '../../../frontend/src/types';
import { DeleteAppointmentFunctionEvent } from '../../../frontend/src/types/lambda';

const { AWS_REGION } = process.env;

const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const sfnClient = new SFNClient({ region: AWS_REGION });

exports.handler = async (event: DeleteAppointmentFunctionEvent) => {
  const { channelArn, appInstanceUserArn } = event;

  try {
    const channelData = await messagingClient.send(
      new DescribeChannelCommand({
        ChannelArn: channelArn,
        ChimeBearer: appInstanceUserArn,
      })
    );
    const metadata: ChannelMetadata = JSON.parse(channelData.Channel!.Metadata!);
    await messagingClient.send(
      new DeleteChannelCommand({
        ChannelArn: channelArn,
        ChimeBearer: appInstanceUserArn,
      })
    );
    if (metadata.sfnExecutionArn) {
      await sfnClient.send(
        new StopExecutionCommand({
          executionArn: metadata.sfnExecutionArn,
        })
      );
    }
  } catch (error: any) {
    console.error(error);
  }
};
