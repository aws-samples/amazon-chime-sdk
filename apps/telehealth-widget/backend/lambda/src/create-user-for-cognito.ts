import { Context, Callback, PostAuthenticationTriggerEvent } from 'aws-lambda';
import { ChimeSDKIdentityClient, CreateAppInstanceUserCommand } from '@aws-sdk/client-chime-sdk-identity';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const { AWS_REGION, CHIME_APP_INSTANCE_ARN, DOCTOR_USER_POOL_GROUP_NAME, PATIENT_USER_POOL_GROUP_NAME } = process.env;
const identityClient = new ChimeSDKIdentityClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

exports.handler = async (event: PostAuthenticationTriggerEvent, _context: Context, callback: Callback) => {
  const {
    triggerSource,
    request: { userAttributes },
  } = event;
  if (triggerSource !== 'PostAuthentication_Authentication') {
    console.log(`User hasn't signed in yet.`);
    callback(null, event);
  }

  try {
    const { sub, name } = userAttributes;
    console.log(`Creating an AppInstanceUser for ${sub}`);
    await identityClient.send(
      new CreateAppInstanceUserCommand({
        AppInstanceArn: CHIME_APP_INSTANCE_ARN,
        AppInstanceUserId: sub,
        Name: name,
      })
    );

    if (userAttributes['custom:accountType'] === 'DOCTOR') {
      console.log(`Add an AppInstanceUser to the group: ${DOCTOR_USER_POOL_GROUP_NAME}`);
      await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          GroupName: DOCTOR_USER_POOL_GROUP_NAME,
          UserPoolId: event.userPoolId,
          Username: sub,
        })
      );
    } else {
      console.log(`Add an AppInstanceUser to the group: ${PATIENT_USER_POOL_GROUP_NAME}`);
      await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          GroupName: PATIENT_USER_POOL_GROUP_NAME,
          UserPoolId: event.userPoolId,
          Username: sub,
        })
      );
    }
  } catch (error: any) {
    console.error(error);
    callback(error, event);
  }

  callback(null, event);
};
