<<<<<<< HEAD
const AWS = require("aws-sdk");
=======
const AWS = require('aws-sdk');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

AWS.config.update({ region: process.env.AWS_REGION });
const chime = new AWS.Chime({ region: process.env.AWS_REGION });

const { CHIME_APP_INSTANCE_ARN } = process.env;

exports.handler = async (event, context, callback) => {
  const username = event.userName;
  const userId = event.request.userAttributes.profile;

  // 'none' is default user profile attribute in Cognito upon registration which
<<<<<<< HEAD
  if (userId === "none") {
=======
  if (userId === 'none') {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    console.log(`User hasn't logged in yet and hasn't been setup with profile`);
    callback(null, event);
  }
  // Create a Chime App Instance User for the user
  const chimeCreateAppInstanceUserParams = {
    AppInstanceArn: CHIME_APP_INSTANCE_ARN,
    AppInstanceUserId: userId,
<<<<<<< HEAD
    Name: username,
=======
    Name: username
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
      body: "Server error while creating app instance",
=======
      body: "Server error while creating app instance"
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };
  }
  // Return to Amazon Cognito
  callback(null, event);
<<<<<<< HEAD
};
=======
};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
