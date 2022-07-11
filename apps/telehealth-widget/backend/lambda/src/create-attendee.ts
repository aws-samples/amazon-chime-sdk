import { ChimeSDKMeetingsClient, CreateAttendeeCommand, GetMeetingCommand } from '@aws-sdk/client-chime-sdk-meetings';
import {
  ChimeSDKMessagingClient,
  DescribeChannelCommand,
  DescribeChannelMembershipCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { CreateAttendeeFunctionEvent } from '../../../frontend/src/types/lambda';

const { AWS_REGION, APP_INSTANCE_ARN, APP_INSTANCE_ADMIN_ARN } = process.env;
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const meetingClient = new ChimeSDKMeetingsClient({ region: AWS_REGION });
const headers = {
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

exports.handler = async (event: CreateAttendeeFunctionEvent) => {
  const { appInstanceUserId, channelArn, meetingId } = event;

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

  // GetMeeting
  let meetingData = undefined;
  try {
    meetingData = await meetingClient.send(
      new GetMeetingCommand({
        MeetingId: meetingId,
      })
    );
    if (!meetingData.Meeting) {
      return {
        statusCode: 404,
        headers,
        body: `Meeting ${meetingId} not found`,
      };
    }
  } catch (error: any) {
    console.error('Error finding meeting');
    throw error;
  }

  // CreateAttendee
  try {
    const attendeeData = await meetingClient.send(
      new CreateAttendeeCommand({
        MeetingId: meetingId,
        ExternalUserId: appInstanceUserId,
      })
    );
    if (!attendeeData.Attendee) {
      return {
        statusCode: attendeeData.$metadata.httpStatusCode,
        headers,
        body: `Problem occurred while creating attendee for meeting ${meetingId}`,
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        JoinInfo: {
          Meeting: meetingData.Meeting,
          Attendee: attendeeData.Attendee,
        },
      }),
    };
  } catch (error: any) {
    console.error(`Error creating attendee for meeting ${meetingId}`);
    throw error;
  }
};
