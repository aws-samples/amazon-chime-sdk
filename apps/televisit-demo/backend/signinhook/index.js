const AWS = require('aws-sdk');

AWS.config.update({ region: process.env.AWS_REGION });
const chime = new AWS.Chime({ region: process.env.AWS_REGION });

const { CHIME_APP_INSTANCE_ARN } = process.env;

exports.handler = async (event, context, callback) => {
  const username = event.userName;
  const userId = event.request.userAttributes.profile;

  // 'none' is default user profile attribute in Cognito upon registration which
  if (userId === 'none') {
    console.log(`User hasn't logged in yet and hasn't been setup with profile`);
    callback(null, event);
  }
  // Create a Chime App Instance User for the user
  const chimeCreateAppInstanceUserParams = {
    AppInstanceArn: CHIME_APP_INSTANCE_ARN,
    AppInstanceUserId: userId,
    Name: username
  };

  try {
    console.log(`Creating app instance user for ${userId}`);
    await chime
      .createAppInstanceUser(chimeCreateAppInstanceUserParams)
      .promise();
  } catch (e) {
    console.log(JSON.stringify(e));
    return {
      statusCode: 500,
      body: "Server error while creating app instance"
    };
  }
  // Return to Amazon Cognito
  callback(null, event);
};