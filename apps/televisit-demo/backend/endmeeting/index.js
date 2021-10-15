const AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });

exports.handler = async event => {
  const meetingId = event.queryStringParameters.meetingId;
  try {
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
  
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      statusCode: 500,
      body: "Server error while deleting meeting"
    };
  }
};