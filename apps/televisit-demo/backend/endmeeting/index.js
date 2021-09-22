const AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });

exports.handler = async event => {
  const meetingId = event.queryStringParameters.meetingId;
  console.info('Deleting meeting');
  await chime
  .deleteMeeting({
    MeetingId: meetingId
  })
  .promise();
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: ''
  };
};