import { ChimeSDKMeetingsClient, CreateMeetingWithAttendeesCommand } from '@aws-sdk/client-chime-sdk-meetings';
import {
  ChimeSDKMessagingClient,
  DescribeChannelCommand,
  DescribeChannelMembershipCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { v4 as uuidv4 } from 'uuid';
import { CreateMeetingFunctionEvent } from '../../../frontend/src/types/lambda';

const { AWS_REGION, APP_INSTANCE_ARN, APP_INSTANCE_ADMIN_ARN } = process.env;
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const meetingClient = new ChimeSDKMeetingsClient({ region: AWS_REGION });
const headers = {
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

exports.handler = async (event: CreateMeetingFunctionEvent) => {
  const { appInstanceUserId, channelArn } = event;
  let { mediaRegion } = event;
  const regions = new Set([
    'af-south-1',
    'ap-south-1',
    'ap-northeast-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ca-central-1',
    'eu-central-1',
    'eu-west-1',
    'eu-west-2',
    'eu-south-1',
    'eu-west-3',
    'eu-north-1',
    'sa-east-1',
    'us-east-2',
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'us-gov-east-1',
    'us-gov-west-1',
  ]);
  if (!regions.has(mediaRegion)) {
    mediaRegion = 'us-east-1';
  }

  const channelData = await messagingClient.send(
    new DescribeChannelCommand({
      ChannelArn: channelArn,
      ChimeBearer: APP_INSTANCE_ADMIN_ARN,
    })
  );
  if (!channelData.Channel) {
    return {
      statusCode: 404,
      headers,
      body: `A channel (${channelArn}) does not exist.`,
    };
  }

  const channelMembershipData = await messagingClient.send(
    new DescribeChannelMembershipCommand({
      ChannelArn: channelArn,
      MemberArn: `${APP_INSTANCE_ARN}/user/${appInstanceUserId}`,
      ChimeBearer: APP_INSTANCE_ADMIN_ARN,
    })
  );
  if (!channelMembershipData.ChannelMembership) {
    return {
      statusCode: 403,
      headers,
      body: `An AppInstanceUser (${appInstanceUserId}) is not a member of the channel (${channelArn}).`,
    };
  }
  try {
    let externalMeetingId = undefined;
    if (channelArn === undefined) {
      externalMeetingId = uuidv4();
    } else {
      const matches = channelArn.match(/channel\/([a-z0-9]{64})$/);
      if (matches && matches.length >= 1) {
        externalMeetingId = matches[1];
      } else {
        externalMeetingId = uuidv4();
      }
    }
    const meetingData = await meetingClient.send(
      new CreateMeetingWithAttendeesCommand({
        ClientRequestToken: uuidv4(),
        ExternalMeetingId: externalMeetingId,
        MediaRegion: mediaRegion,
        Attendees: [
          {
            ExternalUserId: appInstanceUserId,
          },
        ],
      })
    );
    if (!meetingData.Meeting) {
      console.warn('Problem creating meeting');
      return {
        statusCode: meetingData.$metadata.httpStatusCode,
        headers,
        body: 'Problem creating meeting',
      };
    }
    console.log('Meeting created successfully');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        JoinInfo: {
          Meeting: meetingData.Meeting,
          Attendee: meetingData.Attendees![0],
        },
      }),
    };
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
