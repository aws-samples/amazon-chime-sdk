import {
  ChimeSDKMeetingsClient,
  CreateAttendeeCommand,
  DeleteAttendeeCommand,
} from '@aws-sdk/client-chime-sdk-meetings';
import {
  ChannelMessagePersistenceType,
  ChannelMessageType,
  ChimeSDKMessagingClient, SendChannelMessageCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { MeetingInviteStatus, PhoneAttendeePrefix, ReservedMessageContent } from '../../../frontend/src/constants';
import { MessageMetadata } from '../../../frontend/src/types';

const { AWS_REGION, APP_INSTANCE_ARN, TABLE_NAME } = process.env;
const meetingClient = new ChimeSDKMeetingsClient({ region: AWS_REGION });
const messagingClient = new ChimeSDKMessagingClient({ region: AWS_REGION });
const ddbClient = new DynamoDBClient({ region: AWS_REGION });
const ddbDocClient = DynamoDBDocument.from(ddbClient);

type TelephonyEventType =
  | 'ACTION_FAILED'
  | 'ACTION_INTERRUPTED'
  | 'ACTION_SUCCESSFUL'
  | 'CALL_ANSWERED'
  | 'CALL_UPDATE_REQUESTED'
  | 'DIGITS_RECEIVED'
  | 'HANGUP'
  | 'INVALID_LAMBDA_RESPONSE'
  | 'NEW_INBOUND_CALL'
  | 'NEW_OUTBOUND_CALL'
  | 'RINGING';

type ActionType =
  | 'CallAndBridge'
  | 'Hangup'
  | 'JoinChimeMeeting'
  | 'ModifyChimeMeetingAttendee'
  | 'Pause'
  | 'PlayAudio'
  | 'PlayAudioAndGetDigits'
  | 'ReceiveDigits'
  | 'RecordAudio'
  | 'SendDigits'
  | 'Speak'
  | 'SpeakAndGetDigits'
  | 'StartBotConversation'
  | 'VoiceFocus';

interface TelephonyEvent {
  SchemaVersion: '1.0';
  Sequence: number;
  InvocationEventType: TelephonyEventType;
  CallDetails: {
    TransactionId: string;
    AwsAccountId: string;
    AwsRegion: string;
    SipApplicationId: string;
    Participants: {
      CallId: string;
      ParticipantTag: 'LEG-A' | 'LEG-B';
      To: string;
      From: string;
      Direction: 'Inbound' | 'Outbound';
      StartTimeInMilliseconds: string;
      Status: 'Connected' | 'Disconnected';
    }[];
  };
  ActionData?: {
    Type: ActionType;
    Parameters: any;
    ReceivedDigits?: string;
  };
}

interface Action {
  Type: ActionType;
  Parameters: any;
}

const handleActionSuccessful = async (event: TelephonyEvent): Promise<Action[]> => {
  const { ActionData, CallDetails } = event;
  let actions: Action[] = [];

  switch (ActionData?.Type) {
    case 'SpeakAndGetDigits':
      if (ActionData.ReceivedDigits === '1') {
        const data = await ddbDocClient.get({
          TableName: TABLE_NAME,
          Key: {
            transactionId: CallDetails.TransactionId,
          },
        });
        if (data.Item) {
          const {
            channelArn,
            clientId ,
            meetingId,
            patientUsername,
          } = data.Item;

          await messagingClient.send(
            new SendChannelMessageCommand({
              ChannelArn: channelArn,
              Content: encodeURIComponent(ReservedMessageContent.AcceptedInviteByPhone),
              ChimeBearer: `${APP_INSTANCE_ARN}/user/${patientUsername}`,
              Type: ChannelMessageType.STANDARD,
              Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
              Metadata: JSON.stringify({
                isPresence: true,
                clientId,
                isMeetingInvitation: true,
                meetingInviteStatus: MeetingInviteStatus.Accepted,
                meetingId,
              } as MessageMetadata),
            })
          );

          const attendeeData = await meetingClient.send(
            new CreateAttendeeCommand({
              MeetingId: meetingId,
              // Append "(phone)" to allow joining the meeting on phone and web simultaneously.
              ExternalUserId: `${PhoneAttendeePrefix} ${patientUsername}`,
            })
          );

          // Set the <transaction Id, attendee ID> pair in the table item.
          // When handling the "HANGUP" event, this Lambda function will delete the corresponding attendee.
          await ddbClient.send(
            new UpdateItemCommand({
              TableName: TABLE_NAME,
              Key: {
                transactionId: { S: CallDetails.TransactionId },
              },
              UpdateExpression: 'SET callIdMap = :callIdMap',
              ExpressionAttributeValues: {
                ':callIdMap': {
                  M: {
                    [CallDetails.Participants[0].CallId]: {
                      S: attendeeData.Attendee?.AttendeeId!,
                    },
                  },
                },
              },
              ReturnValues: 'UPDATED_NEW',
            })
          );
          actions = [
            {
              Type: 'JoinChimeMeeting',
              Parameters: {
                JoinToken: attendeeData.Attendee?.JoinToken,
                CallId: CallDetails.Participants[0].CallId,
                MeetingId: meetingId,
              },
            },
          ];
        } else {
          actions = [
            {
              Type: 'Speak',
              Parameters: {
                Text: 'The call does not exist. Try again later.',
                CallId: CallDetails.Participants[0].CallId,
                Engine: 'neural',
                LanguageCode: 'en-US',
                TextType: 'text',
                VoiceId: 'Joanna',
              },
            },
            {
              Type: 'Hangup',
              Parameters: {},
            },
          ];
        }
      }
      break;
    default:
      break;
  }

  return actions;
};

const handleCallAnswered = async (event: TelephonyEvent): Promise<Action[]> => {
  const { CallDetails } = event;
  let actions: Action[] = [];
  const data = await ddbDocClient.get({
    TableName: TABLE_NAME,
    Key: {
      transactionId: CallDetails.TransactionId,
    },
  });
  if (data.Item) {
    const { patientName, doctorName } = data.Item;
    actions = [
      {
        Type: 'Pause',
        Parameters: {
          DurationInMilliseconds: '1000',
        },
      },
      {
        Type: 'SpeakAndGetDigits',
        Parameters: {
          CallId: CallDetails.Participants[0].CallId,
          InputDigitsRegex: '^1$',
          SpeechParameters: {
            Text: `Hi ${patientName}, You have an appointment with ${doctorName}. Press 1 to join a call. You can also join a call from your browser using the Amazon Chime SDK Widget Demo.`,
            Engine: 'neural',
            LanguageCode: 'en-US',
            TextType: 'text',
            VoiceId: 'Joanna',
          },
          FailureSpeechParameters: {
            Text: 'You pressed the wrong number.',
            Engine: 'neural',
            LanguageCode: 'en-US',
            TextType: 'text',
            VoiceId: 'Joanna',
          },
          // The following parameters will repeat playing the failure speech
          // until the user presses 1.
          MinNumberOfDigits: 0,
          MaxNumberOfDigits: 1,
          TerminatorDigits: ['#'],
          InBetweenDigitsDurationInMilliseconds: 1000,
          Repeat: 9999,
          RepeatDurationInMilliseconds: 99999999,
        },
      },
    ];
  } else {
    actions = [
      {
        Type: 'Speak',
        Parameters: {
          Text: 'The call does not exist. Try again later.',
          CallId: CallDetails.Participants[0].CallId,
          Engine: 'neural',
          LanguageCode: 'en-US',
          TextType: 'text',
          VoiceId: 'Joanna',
        },
      },
      {
        Type: 'Hangup',
        Parameters: {},
      },
    ];
  }

  return actions;
};

const handleHangup = async (event: TelephonyEvent): Promise<Action[]> => {
  const { ActionData, CallDetails } = event;
  if (ActionData?.Parameters.ParticipantTag === 'LEG-B') {
    // LEG-A is the user, while LEG-B is a call to the Chime SDK meeting.
    // We delete the corresponding Chime SDK attendee and table when the user (LEG-A) ends a call.
    return [];
  }

  try {
    const data = await ddbDocClient.get({
      TableName: TABLE_NAME,
      Key: {
        transactionId: CallDetails.TransactionId,
      },
    });
    if (data.Item) {
      const {
        callIdMap,
        channelArn,
        clientId,
        meetingId,
        patientUsername,
      } = data.Item;
      const attendeeId = callIdMap[CallDetails.Participants[0].CallId];
      if (attendeeId) {
        await meetingClient.send(
          new DeleteAttendeeCommand({
            MeetingId: meetingId,
            AttendeeId: attendeeId,
          })
        );
      } else {
        await messagingClient.send(
          new SendChannelMessageCommand({
            ChannelArn: channelArn,
            Content: encodeURIComponent(ReservedMessageContent.DeclinedInviteByPhone),
            ChimeBearer: `${APP_INSTANCE_ARN}/user/${patientUsername}`,
            Type: ChannelMessageType.STANDARD,
            Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
            Metadata: JSON.stringify({
              isPresence: true,
              clientId,
              isMeetingInvitation: true,
              meetingInviteStatus: MeetingInviteStatus.Declined,
              meetingId,
            } as MessageMetadata),
          })
        );
      }
    }
  } catch (error: any) {
    console.error(
      `Failed to delete the attendee for transaction ID (${event.CallDetails.TransactionId}) due to the error: `,
      error
    );
  }

  try {
    await ddbDocClient.delete({
      TableName: TABLE_NAME,
      Key: {
        transactionId: CallDetails.TransactionId,
      },
    });
  } catch (error: any) {
    console.error(
      `Failed to delete the item for transaction ID (${event.CallDetails.TransactionId}) due to the error: `,
      error
    );
  }

  return [];
};

exports.handler = async (
  event: TelephonyEvent
): Promise<{
  SchemaVersion: '1.0';
  Actions: Action[];
}> => {
  console.log(JSON.stringify(event));

  let actions: Action[] = [];
  const { InvocationEventType } = event;
  switch (InvocationEventType) {
    case 'ACTION_SUCCESSFUL':
      actions = await handleActionSuccessful(event);
      break;
    case 'CALL_ANSWERED':
      actions = await handleCallAnswered(event);
      break;
    case 'HANGUP':
      actions = await handleHangup(event);
      break;
    default:
      break;
  }

  return {
    SchemaVersion: '1.0',
    Actions: actions,
  };
};
