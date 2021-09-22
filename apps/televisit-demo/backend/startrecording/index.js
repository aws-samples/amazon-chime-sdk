const {"v4": uuidv4} = require('uuid');
var AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

const mediaCaptureBucket = process.env['MEDIA_CAPTURE_BUCKET']
const aws_account_id = process.env['ACCOUNT_ID']

exports.handler = async event => {
  console.log("trigger event: "+JSON.stringify(event));
  const meetingId = event.queryStringParameters.meetingId;
  
  try {
    // const meetingInfo = await chime.getMeeting({MeetingId: meetingId}).promise();
    // const attendees = await chime.listAttendees({MeetingId: meetingId}).promise();
      
    const captureRequest = {
      "SourceType": "ChimeSdkMeeting",
      "SourceArn": "arn:aws:chime::" + aws_account_id + ":meeting:" + meetingId,
      "SinkType": "S3Bucket",
      "SinkArn": "arn:aws:s3:::" + mediaCaptureBucket + "/captures/" + meetingId    
    }
    console.log(captureRequest);
    const captureInfo = await chime.createMediaCapturePipeline(captureRequest).promise()
    console.log(captureInfo)
    const response = {
      statusCode: 200,
      body: JSON.stringify(captureInfo),
      headers: {
        'Access-Control-Allow-Headers': 'Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
    return response
  } catch (err) {
     console.log(err)
     return err
  }
};