// Lambda that validates user tokens and returns AWS Creds for access to chime, scoped to that user
<<<<<<< HEAD
const AWS = require("aws-sdk");
const uuidv4 = require("uuid");
=======
const AWS = require('aws-sdk');
const uuidv4 = require('uuid');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
AWS.config.update({ region: process.env.AWS_REGION });
const chime = new AWS.Chime({ region: process.env.AWS_REGION });
const sts = new AWS.STS({ region: process.env.AWS_REGION });
const APP_INSTANCE_ID = process.env.ChimeAppInstanceArn;
const USER_ROLE_ARN = process.env.UserRoleArn;
const ANON_USER_ROLE_ARN = process.env.AnonUserRole;

// STEP 1: Validate your identity providers access token and return user information
// including UUID, and optionally username or additional metadata
function validateAccessTokenOrCredsAndReturnUser(identityToken) {
  // For purposes of simulating the exchange, this function defaults to returning anonymous user access.
  // To authenticate known users add logic to validate your auth token here.  The function
  // will need to return the users uuid and optionally display name and/or other metadata
  const randomUserID = `anon_${uuidv4()}`;
  return {
    uuid: randomUserID,
    displayName: randomUserID,
<<<<<<< HEAD
    metadata: null,
=======
    metadata: null
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };
}

// STEP 2: get AWS Creds by calling assumeRole with the user info returned
// in step one.
async function assumeRole(user) {
<<<<<<< HEAD
  const assumedRoleResponse = await sts
    .assumeRole({
      RoleArn: ANON_USER_ROLE_ARN, // Give anonymous permissions
      RoleSessionName: `chime_${user.uuid}`,
      DurationSeconds: "3600", // 1 hour, often want to set this to the duration of access token from IdP
      Tags: [
        {
          Key: "UserUUID", // parameterizes IAM Role with users UUID
          Value: user.uuid,
        },
      ],
    })
    .promise();
  return assumedRoleResponse.Credentials; // returns AWS Creds
=======
  const assumedRoleResponse = await sts.assumeRole({
    RoleArn: ANON_USER_ROLE_ARN, // Give anonymous permissions
    RoleSessionName: `chime_${user.uuid}`,
    DurationSeconds: '3600', // 1 hour, often want to set this to the duration of access token from IdP
    Tags: [{
      Key: 'UserUUID', // parameterizes IAM Role with users UUID
      Value: user.uuid
    }]
  }).promise();
  return assumedRoleResponse.Credentials;  // returns AWS Creds
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
}

// STEP 3: Create or get user in Chime (create is NOOP if already exists)
async function createOrGetChimeUserArn(user) {
  const createUserResponse = await chime
    .createAppInstanceUser({
      AppInstanceArn: APP_INSTANCE_ID,
      AppInstanceUserId: user.uuid,
      ClientRequestToken: uuidv4(),
<<<<<<< HEAD
      Name: user.displayName,
=======
      Name: user.displayName
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    })
    .promise();
  return createUserResponse.AppInstanceUserArn;
}

// MAIN, call above in order
<<<<<<< HEAD
exports.handler = async (event) => {
=======
exports.handler = async event => {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const method = event.httpMethod;
  const { path } = event;
  const authToken = event.headers.Authorization;
  let creds = null;
  try {
    const user = validateAccessTokenOrCredsAndReturnUser(authToken);
    if (user !== null) {
      creds = await assumeRole(user);
      const userArn = await createOrGetChimeUserArn(user);
      return {
        statusCode: 200,
        headers: {
<<<<<<< HEAD
          "Access-Control-Allow-Headers": "Authorization",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Credentials": "true",
=======
          'Access-Control-Allow-Headers': 'Authorization',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Credentials': 'true'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        },
        body: JSON.stringify({
          ChimeAppInstanceUserArn: userArn,
          ChimeUserId: user.uuid,
          ChimeCredentials: creds,
<<<<<<< HEAD
          ChimeDisplayName: user.displayName,
        }),
=======
          ChimeDisplayName: user.displayName
        })
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      };
    }
  } catch (err) {
    console.log(`ERROR: unexpected exception ${err}`);
<<<<<<< HEAD
  }

=======
 }
 
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  // Default response to not authorized
  return {
    statusCode: 401,
    headers: {
<<<<<<< HEAD
      "Access-Control-Allow-Headers": "Authorization",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Credentials": "true",
    },
    body: "Not Authorized",
  };
};
=======
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: 'Not Authorized'
  };
};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
