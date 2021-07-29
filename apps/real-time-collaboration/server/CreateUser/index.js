// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const {"v4": uuidv4} = require('uuid');
AWS.config.update({region: process.env.AWS_REGION});
const chime = new AWS.Chime({region: process.env.AWS_REGION});
const sts = new AWS.STS({region: process.env.AWS_REGION});
const USER_ROLE_ARN = process.env.UserRoleArn;

// STEP 1: Get AWS Creds For User
async function getChimeCreds(userId) {
  const assumedRoleResponse = await sts
    .assumeRole({
      RoleArn: USER_ROLE_ARN,
      RoleSessionName: `chime_${userId}`,
      DurationSeconds: '3600', // 1 hour
      Tags: [
        {
          Key: 'UserUUID', // parameterizes IAM policy's ${aws:PrincipalTag/UserUUID}
          Value: userId
        }
      ]
    })
    .promise();
  return assumedRoleResponse.Credentials;
}

// STEP 2: Create user in Chime
async function createChimeUserArn(userId, userName, appInstanceArn) {
  console.log(`Creating user ${userName} with Id = ${userId}`);
  const createUserResponse = await chime
    .createAppInstanceUser({
      AppInstanceArn: appInstanceArn,
      AppInstanceUserId: userId,
      ClientRequestToken: uuidv4(),
      Name: userName
    })
    .promise();
  return createUserResponse.AppInstanceUserArn;
}

// STEP 3: Add user to channel
async function addToChannel(userArn, channelArn, adminUserArn) {
  console.log(`Adding ${userArn} to channel`);
  const params = {
    ChannelArn: channelArn,
    MemberArn: userArn,
    Type: 'DEFAULT', // OPTIONS ARE: DEFAULT and HIDDEN
  };

  const request = chime.createChannelMembership(params);
  request.on('build', function () {
    request.httpRequest.headers["x-amz-chime-bearer"] = adminUserArn;
  });
  const response = await request.promise();
  console.log(response);
}

exports.handler = async (event, context, callback) => {
  console.log('Event: \n', event);
  const requestBody = JSON.parse(event.body);
  const userName = requestBody.userName;
  const appInstanceArn = requestBody.appInstanceArn;
  const channelArn = requestBody.channelArn;
  const adminUserArn = requestBody.adminUserArn;
  const userId = uuidv4();
  try {
    const creds = await getChimeCreds(userId);
    const userArn = await createChimeUserArn(userId, userName, appInstanceArn);
    await addToChannel(userArn, channelArn, adminUserArn);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
      body: JSON.stringify({
        ChimeAppInstanceUserArn: userArn,
        ChimeUserId: userId,
        ChimeCredentials: creds,
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
      'Access-Control-Allow-Methods': 'POST',
    },
    body: 'Not Authorized'
  };
}
