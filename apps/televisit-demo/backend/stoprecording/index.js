const AWS = require('aws-sdk');
const chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

exports.handler = async event => {
    console.log("trigger event: " + JSON.stringify(event));

    const mediapipelineid = event.queryStringParameters.mediapipelineid;
    await chime.deleteMediaCapturePipeline({
        MediaPipelineId: mediapipelineid
    }).promise();

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