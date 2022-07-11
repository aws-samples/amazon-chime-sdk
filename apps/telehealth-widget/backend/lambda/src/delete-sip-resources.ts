import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import { ChimeClient, DeletePhoneNumberCommand, DeleteSipMediaApplicationCommand } from '@aws-sdk/client-chime';

const { AWS_REGION, SIP_MEDIA_APPLICATION_ID, PHONE_NUMBER, STACK_NAME } = process.env;
const chimeClient = new ChimeClient({ region: AWS_REGION });

exports.handler = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Delete') {
    try {
      let response = await chimeClient.send(
        new DeletePhoneNumberCommand({
          PhoneNumberId: PHONE_NUMBER,
        })
      );
      if (response.$metadata.httpStatusCode === 204) {
        console.info('Phone number deleted successfully');
        response = await chimeClient.send(
          new DeleteSipMediaApplicationCommand({
            SipMediaApplicationId: SIP_MEDIA_APPLICATION_ID,
          })
        );
        if (response.$metadata.httpStatusCode === 204) {
          console.info('SIP media application deleted successfully');
        } else {
          console.error(
            `Failed to delete SIP media application with HTTP status: ${response.$metadata.httpStatusCode}`
          );
        }
      } else {
        console.error(`Failed to delete phone number with HTTP status: ${response.$metadata.httpStatusCode}`);
      }
    } catch (error) {
      console.error(`Error deleting SIP resources for stack: ${STACK_NAME}`, error);
    } finally {
      return {};
    }
  } else {
    // Update or Create lifecyle events ignored here as this lambda is for deletion.
    return {};
  }
};
