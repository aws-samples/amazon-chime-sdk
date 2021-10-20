const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const chime = new AWS.Chime({ region: 'us-east-1' });
const APP_INSTANCE_ID = process.env.ChimeAppInstanceArn;
const serverAdminUserId = 'ModeratorBot';
const serverAdminArn = `${APP_INSTANCE_ID}/user/${serverAdminUserId}`;
const appInstanceUserArnHeader = 'x-amz-chime-bearer';

exports.handler = async (event) => {
  const { userId, channel, name } = event.queryStringParameters;
  const region = 'us-east-1';
  console.info('Validating channel');
  const describeChannelParams = {
    ChannelArn: channel,
  };
  const describeChanneRequest = await chime.describeChannel(
    describeChannelParams
  );
  describeChanneRequest.on('build', function () {
    describeChanneRequest.httpRequest.headers[appInstanceUserArnHeader] =
      serverAdminArn;
  });
  const describeChannelResponse = await describeChanneRequest.promise();
  if (!describeChannelResponse.Channel) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: 'Meeting channel does not exist',
    };
  }
  console.info('Validating membership');
  const describeChannelMembershipParams = {
    ChannelArn: channel,
    MemberArn: `${APP_INSTANCE_ID}/user/${userId}`,
  };
  const describeChannelMembershipRequest =
    await chime.describeChannelMembership(describeChannelMembershipParams);
  describeChannelMembershipRequest.on('build', function () {
    describeChannelMembershipRequest.httpRequest.headers[
      appInstanceUserArnHeader
    ] = serverAdminArn;
  });
  const describeChannelMembershipResponse =
    await describeChannelMembershipRequest.promise();
  if (!describeChannelMembershipResponse.ChannelMembership) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: 'User is not a member of meeting channel',
    };
  }
  console.info('Creating new meeting before joining');
  const createMeetingRequest = {
    ClientRequestToken: uuidv4(),
    ExternalMeetingId: describeChannelResponse.Channel.Name,
    MediaRegion: region,
  };
  const meetingInfo = await chime.createMeeting(createMeetingRequest).promise();
  console.info('Adding new attendee');
  const attendeeInfo = await chime
    .createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: name,
    })
    .promise();
  const joinInfo = {
    JoinInfo: {
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify(joinInfo, '', 2),
  };
};
