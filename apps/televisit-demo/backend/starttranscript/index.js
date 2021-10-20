const { v4: uuidv4 } = require('uuid');
var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('trigger event: ' + JSON.stringify(event));
  const meetingId = event.queryStringParameters.meetingId;
  try {
    const response = await chime
      .startMeetingTranscription({
        MeetingId: meetingId,
        TranscriptionConfiguration: {
          EngineTranscribeMedicalSettings: {
            Region: 'us-east-1',
            LanguageCode: 'en-US',
            Specialty: 'PRIMARYCARE',
            Type: 'CONVERSATION',
          },
        },
      })
      .promise();

    console.log(JSON.stringify(response));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify(response, '', 2),
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};
