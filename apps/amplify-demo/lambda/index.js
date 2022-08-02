/* Amplify Params - DO NOT EDIT
  API_CHIME_GRAPHQLAPIENDPOINTOUTPUT
  API_CHIME_GRAPHQLAPIIDOUTPUT
  API_CHIME_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

const { USE_EVENT_BRIDGE, SQS_QUEUE_ARN } = process.env;

// Create a unique id
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function response(statusCode, contentType, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': contentType },
    body: body,
    isBase64Encoded: false
  };
}

const createChimeMeeting = async (context) => {
  const title = context.arguments.title;
  const region = context.arguments.region || 'us-east-1';
  const name = context.arguments.name;

  if (!title || !name) {
    return response(400, 'application/json', JSON.stringify({
      error: 'Required properties: meeting title, name'
    }));
  }
  const request = {
    ClientRequestToken: uuid(),
    MediaRegion: region,
    NotificationsConfiguration: USE_EVENT_BRIDGE === 'false' ? { SqsQueueArn: SQS_QUEUE_ARN } : {},

    // Any meeting ID you wish to associate with the meeting.
    // For simplicity here, we use the meeting title.
    ExternalMeetingId: title.substring(0, 64),
    Tags: [
      { Key: 'Department', Value: 'RND' }
    ]
  };
  console.info('Creating new chime meeting: ' + JSON.stringify(request));
  meetingInfo = await chime.createMeeting(request).promise();

  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingInfo.Meeting.MeetingId,

    // Any user ID you wish to associate with the attendeee.
    // For simplicity here, we use a random UUID for uniqueness
    // combined with the name the user provided, which can later
    // be used to help build the roster.
    ExternalUserId: `${uuid().substring(0, 8)}#${name}`.substring(0, 64),
  }).promise());

  return response(200, 'application/json', JSON.stringify(
    {
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    }, null, 2));
};

const joinChimeMeeting = async (context) => {
  const meetingId = context.arguments.meetingId;
  const name = context.arguments.name;

  if (!meetingId || !name) {
    return response(400, 'application/json', JSON.stringify({
      error: 'Required properties: meeting Id, name'
    }));
  }

  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingId,

    // Any user ID you wish to associate with the attendeee.
    // For simplicity here, we use a random UUID for uniqueness
    // combined with the name the user provided, which can later
    // be used to help build the roster.
    ExternalUserId: `${uuid().substring(0, 8)}#${name}`.substring(0, 64),
  }).promise());

  return response(200, 'application/json', JSON.stringify(
    {
      Attendee: attendeeInfo.Attendee
    }, null, 2));
};

const endChimeMeeting = async (context) => {
  const meetingId = context.arguments.meetingId;
  await chime.deleteMeeting({ MeetingId: meetingId });
  console.log('Deleted Meeting: ' + meetingId);
  return response(200, 'application/json', JSON.stringify({}));
};


const resolvers = {
  Query: {
    createChimeMeeting: context => {
      return createChimeMeeting(context);
    },
    joinChimeMeeting: context => {
      return joinChimeMeeting(context);
    },
    endChimeMeeting: context => {
      return endChimeMeeting(context);
    }
  },
};

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  const typeHandler = resolvers[event.typeName];
  if (typeHandler) {
    const resolver = typeHandler[event.fieldName];
    if (resolver) {
      return await resolver(event);
    }
  }
  throw new Error('Resolver not found.');
};
