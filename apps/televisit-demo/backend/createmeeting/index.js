<<<<<<< HEAD
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const chime = new AWS.Chime({ region: "us-east-1" });
const APP_INSTANCE_ID = process.env.ChimeAppInstanceArn;
const serverAdminUserId = "ModeratorBot";
const serverAdminArn = `${APP_INSTANCE_ID}/user/${serverAdminUserId}`;
const appInstanceUserArnHeader = "x-amz-chime-bearer";

exports.handler = async (event) => {
  const { userId, channel, name } = event.queryStringParameters;
  const region = "us-east-1";
  console.info("Validating channel");
  const describeChannelParams = {
    ChannelArn: channel,
  };
  const describeChanneRequest = await chime.describeChannel(
    describeChannelParams
  );
  describeChanneRequest.on("build", function () {
    describeChanneRequest.httpRequest.headers[appInstanceUserArnHeader] =
      serverAdminArn;
=======
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const chime = new AWS.Chime({ region: 'us-east-1' });
const APP_INSTANCE_ID = process.env.ChimeAppInstanceArn;
const serverAdminUserId = 'ModeratorBot';
const serverAdminArn = `${APP_INSTANCE_ID}/user/${serverAdminUserId}`;
const appInstanceUserArnHeader = 'x-amz-chime-bearer';

exports.handler = async event => {
  const { userId, channel, name } = event.queryStringParameters;
  const region = 'us-east-1';
  console.info('Validating channel');
  const describeChannelParams = {
    ChannelArn: channel
  };
  const describeChanneRequest = await chime.describeChannel(describeChannelParams);
  describeChanneRequest.on('build', function() {
    describeChanneRequest.httpRequest.headers[appInstanceUserArnHeader] = serverAdminArn;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const describeChannelResponse = await describeChanneRequest.promise();
  if (!describeChannelResponse.Channel) {
    return {
      statusCode: 404,
      headers: {
<<<<<<< HEAD
        "Access-Control-Allow-Headers": "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      },
      body: "Meeting channel does not exist",
    };
  }
  console.info("Validating membership");
  const describeChannelMembershipParams = {
    ChannelArn: channel,
    MemberArn: `${APP_INSTANCE_ID}/user/${userId}`,
  };
  const describeChannelMembershipRequest =
    await chime.describeChannelMembership(describeChannelMembershipParams);
  describeChannelMembershipRequest.on("build", function () {
    describeChannelMembershipRequest.httpRequest.headers[
      appInstanceUserArnHeader
    ] = serverAdminArn;
  });
  const describeChannelMembershipResponse =
    await describeChannelMembershipRequest.promise();
=======
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: 'Meeting channel does not exist'
    };
  }
  console.info('Validating membership');
  const describeChannelMembershipParams = {
    ChannelArn: channel,
    MemberArn:  `${APP_INSTANCE_ID}/user/${userId}`
  };
  const describeChannelMembershipRequest = await chime.describeChannelMembership(describeChannelMembershipParams);
  describeChannelMembershipRequest.on('build', function() {
    describeChannelMembershipRequest.httpRequest.headers[appInstanceUserArnHeader] = serverAdminArn;
  });
  const describeChannelMembershipResponse = await describeChannelMembershipRequest.promise();
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  if (!describeChannelMembershipResponse.ChannelMembership) {
    return {
      statusCode: 403,
      headers: {
<<<<<<< HEAD
        "Access-Control-Allow-Headers": "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      },
      body: "User is not a member of meeting channel",
    };
  }
  console.info("Creating new meeting before joining");
=======
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: 'User is not a member of meeting channel'
    };
  }
  console.info('Creating new meeting before joining');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const createMeetingRequest = {
    ClientRequestToken: uuidv4(),
    ExternalMeetingId: describeChannelResponse.Channel.Name,
    MediaRegion: region,
  };
  const meetingInfo = await chime.createMeeting(createMeetingRequest).promise();
<<<<<<< HEAD
  console.info("Adding new attendee");
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
      "Access-Control-Allow-Headers": "Authorization",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(joinInfo, "", 2),
  };
};
=======
  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: name,
    }).promise());
  const joinInfo = {
    JoinInfo: {
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee
    },
  };
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: JSON.stringify(joinInfo, '', 2)
  };
};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
