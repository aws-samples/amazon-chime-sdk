import {
  ChimeClient,
  CreatePhoneNumberOrderCommand,
  CreateSipMediaApplicationCommand,
  GetPhoneNumberOrderCommand,
  GetPhoneNumberOrderCommandOutput,
  PhoneNumberOrderStatus,
  PhoneNumberProductType,
  SearchAvailablePhoneNumbersCommand,
} from '@aws-sdk/client-chime';
import { IAMClient, CreateServiceLinkedRoleCommand } from '@aws-sdk/client-iam';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

const { AWS_REGION, HANDLE_TELEPHONY_EVENTS_FUNCTION_ARN, STACK_NAME } = process.env;
const chimeClient = new ChimeClient({ region: AWS_REGION });
const iamClient = new IAMClient({ region: AWS_REGION });

const getPhoneNumber = async (): Promise<string> => {
  let phoneNumber: string | undefined;

  // Search available phone numbers up to 10 times.
  // Why? SearchAvailablePhoneNumbersCommand may return an empty list for the specific toll-free code.
  for (let i = 0; i < 10; i++) {
    const tollFreeCodes = ['833', '844', '855', '866', '877', '888'];
    const tollFreeCode = tollFreeCodes[Math.floor(Math.random() * tollFreeCodes.length)];
    const data = await chimeClient.send(
      new SearchAvailablePhoneNumbersCommand({
        MaxResults: 1,
        TollFreePrefix: tollFreeCode,
      })
    );
    phoneNumber = data.E164PhoneNumbers?.[0];
    if (phoneNumber) {
      break;
    }
  }

  if (phoneNumber) {
    const data = await chimeClient.send(
      new CreatePhoneNumberOrderCommand({
        ProductType: PhoneNumberProductType.SipMediaApplicationDialIn,
        E164PhoneNumbers: [phoneNumber],
      })
    );
    const { PhoneNumberOrderId } = data.PhoneNumberOrder!;

    let orderData: GetPhoneNumberOrderCommandOutput;
    let timeoutCount: number = 0;
    do {
      if (timeoutCount++ === 12) {
        throw new Error(
          `Failed to get the phone number because the phone number (${phoneNumber}) order status did not change to "Successful" for more than a minute.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      orderData = await chimeClient.send(
        new GetPhoneNumberOrderCommand({
          PhoneNumberOrderId,
        })
      );
    } while (orderData.PhoneNumberOrder?.Status !== PhoneNumberOrderStatus.Successful);
    return phoneNumber;
  } else {
    throw new Error(`No phone number is available.`);
  }
};

exports.handler = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Create') {
    try {
      const data = await chimeClient.send(
        new CreateSipMediaApplicationCommand({
          AwsRegion: AWS_REGION,
          Name: STACK_NAME,
          Endpoints: [
            {
              LambdaArn: HANDLE_TELEPHONY_EVENTS_FUNCTION_ARN,
            },
          ],
        })
      );
      const phoneNumber = await getPhoneNumber();

      // Some telephony actions for the Chime SIP Media Application require the Amazon Chime Voice Connector
      // service-linked role to call other AWS services on your behalf.
      try {
        await iamClient.send(
          new CreateServiceLinkedRoleCommand({
            AWSServiceName: 'voiceconnector.chime.amazonaws.com',
          })
        );
      } catch (error: any) {
        // The service-linked role might already exist.
        console.log(error);
      }

      return {
        Data: {
          SipMediaApplicationId: data.SipMediaApplication?.SipMediaApplicationId,
          PhoneNumber: phoneNumber,
        },
      };
    } catch (error: any) {
      console.warn(`Failed to create: `, error);
      throw new Error(`Failed to create: ${error?.message}`);
    }
  } else {
    // Update or Delete
    return {};
  }
};
