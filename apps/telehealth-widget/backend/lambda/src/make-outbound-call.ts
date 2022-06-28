import { ChimeClient, CreateSipMediaApplicationCallCommand } from '@aws-sdk/client-chime';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { CognitoUser } from '../../../frontend/src/types';
import { getCognitoUser } from './utils';
import { MakeOutboundCallFunctionEvent } from '../../../frontend/src/types/lambda';

const { AWS_REGION, COGNITO_USER_POOL_ID, PHONE_NUMBER, SIP_MEDIA_APPLICATION_ID, TABLE_NAME } = process.env;
const chimeClient = new ChimeClient({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });
const ddbClient = new DynamoDBClient({ region: AWS_REGION });
const ddbDocClient = DynamoDBDocument.from(ddbClient);

exports.handler = async (event: MakeOutboundCallFunctionEvent) => {
  const { channelArn, clientId, doctorUsername, meetingId, patientUsername } = event;
  try {
    const [doctorData, patientData] = await Promise.all([
      cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: doctorUsername,
        })
      ),
      cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: patientUsername,
        })
      ),
    ]);

    const doctor: CognitoUser = getCognitoUser(doctorUsername, doctorData);
    const patient: CognitoUser = getCognitoUser(patientUsername, patientData);

    const callData = await chimeClient.send(
      new CreateSipMediaApplicationCallCommand({
        FromPhoneNumber: PHONE_NUMBER,
        SipMediaApplicationId: SIP_MEDIA_APPLICATION_ID,
        ToPhoneNumber: patient.attributes.phone_number,
      })
    );
    await ddbDocClient.put({
      TableName: TABLE_NAME,
      Item: {
        // The callIdMap will have a map of the SIP Call ID to the Chime SDK attendee ID.
        callIdMap: {},
        channelArn,
        clientId,
        doctorName: doctor.attributes.name,
        doctorUsername,
        meetingId,
        patientName: patient.attributes.name,
        patientUsername,
        transactionId: callData.SipMediaApplicationCall!.TransactionId,
      },
    });
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
