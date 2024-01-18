// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { ChimeSDKMeetings } = require('@aws-sdk/client-chime-sdk-meetings');
const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const chimeSDKMeetings = new ChimeSDKMeetings({ region: 'us-east-1' });
const ddb = new DynamoDB();

const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

// Read resource names from the environment
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const sqsQueueArn = process.env.SQS_QUEUE_ARN;
const provideQueueArn = process.env.USE_EVENT_BRIDGE === 'false';
const logGroupName = process.env.BROWSER_LOG_GROUP_NAME;

// Create a unique id
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Retrieve meeting from the meeting table by meeting title
const getMeeting = async (meetingTitle) => {
  const result = await ddb.getItem({
    TableName: meetingsTableName,
    Key: {
      Title: {
        S: meetingTitle,
      },
    },
  });
  return result.Item ? JSON.parse(result.Item.Data.S) : null;
};

// Add meeting in the meeting table
const putMeeting = async (title, meetingInfo) => {
  await ddb.putItem({
    TableName: meetingsTableName,
    Item: {
      Title: { S: title },
      Data: { S: JSON.stringify(meetingInfo) },
      TTL: {
        N: '' + oneDayFromNow,
      },
    },
  });
};

// Retrieve attendee from the attendee table
const getAttendee = async (title, attendeeId) => {
  const result = await ddb.getItem({
    TableName: attendeesTableName,
    Key: {
      AttendeeId: {
        S: `${title}/${attendeeId}`,
      },
    },
  });
  if (!result.Item) {
    return 'Unknown';
  }
  return result.Item.Name.S;
};

// Add attendee in the attendee table
const putAttendee = async (title, attendeeId, attendeeName) => {
  await ddb.putItem({
    TableName: attendeesTableName,
    Item: {
      AttendeeId: {
        S: `${title}/${attendeeId}`,
      },
      Name: { S: attendeeName },
      TTL: {
        N: '' + oneDayFromNow,
      },
    },
  });
};

// Set up SQS notifications
function getNotificationsConfig() {
  if (provideQueueArn) {
    return {
      SqsQueueArn: sqsQueueArn,
    };
  }
  return {};
}

exports.join = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    isBase64Encoded: false,
  };
  const { title, attendeeName, region = 'us-east-1', ns_es } = JSON.parse(event.body);

  if (!title || !attendeeName) {
    response['statusCode'] = 400;
    response['body'] = 'Must provide title and name';
    callback(null, response);
    return;
  }

  let meetingInfo = await getMeeting(title);

  if (!meetingInfo) {
    const request = {
      ClientRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
    };
    console.info('Creating new meeting before joining: ' + JSON.stringify(request));
    meetingInfo = await chimeSDKMeetings.createMeeting(request);
    await putMeeting(title, meetingInfo);
  }

  console.info('Adding new attendee');
  const attendeeInfo = await chimeSDKMeetings.createAttendee({
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: uuid(),
  });
  putAttendee(title, attendeeInfo.Attendee.AttendeeId, attendeeName);

  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    },
  };

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};

exports.end = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    isBase64Encoded: false,
  };
  const { title } = JSON.parse(event.body);
  const meetingInfo = await getMeeting(title);
  await chimeSDKMeetings.deleteMeeting({
    MeetingId: meetingInfo.Meeting.MeetingId,
  });
  callback(null, response);
};

exports.attendee = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    isBase64Encoded: false,
  };
  const { title, attendeeId } = event.queryStringParameters;

  const attendeeInfo = {
    AttendeeId: attendeeId,
    Name: await getAttendee(title, attendeeId),
  };
  response.body = JSON.stringify(attendeeInfo, '', 2);
  callback(null, response);
};

// Called when SQS receives records of meeting events and logs out those records
exports.sqs_handler = async (event, context, callback) => {
  const records = event.Records;

  console.log(records);

  return {};
};

// Called when EventBridge receives a meeting event and logs out the event
exports.event_bridge_handler = async (event, context, callback) => {
  console.log(event);

  return {};
};

async function ensureLogStream(cloudWatchClient, logStreamName) {
  const describeLogStreamsParams = {
    logGroupName: logGroupName,
    logStreamNamePrefix: logStreamName,
  };
  const response = await cloudWatchClient.describeLogStreams(describeLogStreamsParams);
  const foundStream = response.logStreams.find((s) => s.logStreamName === logStreamName);
  if (foundStream) {
    return foundStream.uploadSequenceToken;
  }
  const putLogEventsInput = {
    logGroupName: logGroupName,
    logStreamName: logStreamName,
  };
  await cloudWatchClient.createLogStream(putLogEventsInput);
  return null;
}

exports.logs = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    isBase64Encoded: false,
  };
  {
    const body = JSON.parse(event.body);
    if (!body.logs || !body.appName || !body.timestamp) {
      response.body = 'Empty Parameters Received';
      response.statusCode = 400;
      return response;
    }
    const logStreamName = `ChimeReactSDKMeeting_${body.timestamp}`;
    const cloudWatchClient = new CloudWatchLogs({
      apiVersion: '2014-03-28',
    });
    const putLogEventsInput = {
      logGroupName: logGroupName,
      logStreamName: logStreamName,
    };
    const uploadSequence = await ensureLogStream(cloudWatchClient, logStreamName);
    if (uploadSequence) {
      putLogEventsInput['sequenceToken'] = uploadSequence;
    }
    const logEvents = [];
    if (body.logs.length > 0) {
      for (let i = 0; i < body.logs.length; i++) {
        const log = body.logs[i];
        const timestampIso = new Date(log.timestampMs).toISOString();
        let message = `${body.appName} ${timestampIso} [${log.sequenceNumber}] [${log.logLevel}]`;
        if (body.meetingId && body.attendeeId) {
          message = `${message} [meetingId: ${body.meetingId.toString()}] [attendeeId: ${body.attendeeId}]: ${
            log.message
          }`;
        } else {
          message = `${message}: ${log.message}`;
        }
        logEvents.push({
          message: message,
          timestamp: log.timestampMs,
        });
      }
      putLogEventsInput['logEvents'] = logEvents;
      await cloudWatchClient.putLogEvents(putLogEventsInput);
    }
  }
  return response;
};
