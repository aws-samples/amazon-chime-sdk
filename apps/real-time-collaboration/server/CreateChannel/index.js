// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});
const chime = new AWS.Chime({region: process.env.AWS_REGION});

async function createChannel(appInstanceArn, appInstanceUserArn) {
  console.log('Create Channel');
  const dateNow = new Date();
  const params = {
    Name: 'Channel',
    AppInstanceArn: appInstanceArn,
    ClientRequestToken: dateNow.getHours().toString() + dateNow.getMinutes().toString(),
    ChimeBearer: appInstanceUserArn,
    Mode: 'RESTRICTED',
    Privacy: 'PRIVATE'
  };
  const response = await chime.createChannel(params).promise();
  return response.ChannelArn;
}

exports.handler = async (event, context, callback) => {
  console.log('Event: \n', event);
  const requestBody = JSON.parse(event.body);
  try {
    const channelArn = await createChannel(requestBody.appInstanceArn, requestBody.appInstanceUserArn);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({
        ChimeChannelArn: channelArn,
      })
    };
  } catch (err) {
    console.log(`ERROR: unexpected exception ${err}`);
  }

  // Default response to not authorized
  return {
    statusCode: 401,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST'
    },
    body: 'Not Authorized'
  };
}
