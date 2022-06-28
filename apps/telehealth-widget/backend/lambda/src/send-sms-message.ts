import { ChimeSDKMessagingClient, DescribeChannelCommand } from '@aws-sdk/client-chime-sdk-messaging';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

import { Presence } from '../../../frontend/src/constants';
import { ChannelMetadata } from '../../../frontend/src/types';

/**
 * Specify the dedicated phone number in E.164 format. For example,
 *
 * const ORIGINATION_PHONE_NUMBER = '+12065550100';
 *
 * If not specified, Amazon Pinpoint assigns one of the phone numbers and sends the SMS message
 * from that phone number. See REAMDE.md for requesting phone numbers.
 */
const ORIGINATION_PHONE_NUMBER = '';

const { AWS_REGION, APP_INSTANCE_ADMIN_ARN, PINPOINT_APPLICATION_ID } = process.env;
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const pinpointClient = new PinpointClient({ region: AWS_REGION });

exports.handler = async (event: any) => {
  const { channelArn } = event;

  try {
    const data = await messagingClient.send(
      new DescribeChannelCommand({
        ChannelArn: channelArn,
        ChimeBearer: APP_INSTANCE_ADMIN_ARN,
      })
    );

    const metadata: ChannelMetadata = JSON.parse(data.Channel?.Metadata!);
    const addresses: Record<string, { ChannelType: 'SMS'; BodyOverride: string }> = {};
    if (metadata.presenceMap[metadata.doctor.username].presence === Presence.Added) {
      addresses[metadata.doctor.phone] = {
        ChannelType: 'SMS',
        BodyOverride: `Check in for your appointment with ${metadata.patient.name}.`,
      };
    }

    if (metadata.presenceMap[metadata.patient.username].presence === Presence.Added) {
      addresses[metadata.patient.phone] = {
        ChannelType: 'SMS',
        BodyOverride: `Check in for your appointment with ${metadata.doctor.name}.`,
      };
    }

    if (Object.keys(addresses).length > 0) {
      await pinpointClient.send(
        new SendMessagesCommand({
          ApplicationId: PINPOINT_APPLICATION_ID,
          MessageRequest: {
            Addresses: addresses,
            MessageConfiguration: {
              SMSMessage: {
                MessageType: 'TRANSACTIONAL',
                ...(ORIGINATION_PHONE_NUMBER
                  ? {
                      OriginationNumber: ORIGINATION_PHONE_NUMBER,
                    }
                  : {}),
              },
            },
          },
        })
      );
    }
  } catch (error: any) {
    console.error(error);
  }
};
