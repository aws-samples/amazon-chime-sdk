import { ChannelSummary } from '@aws-sdk/client-chime-sdk-messaging';

import { MeetingInviteStatus, Presence } from '../constants';

export interface MessageWrapper {
  content: string;
  createdTimestamp: Date;
  messageId: string;
  senderName: string;
  senderArn: string;
  local: boolean;
}

export interface ChannelMetadata {
  appointmentTimestamp: Date;
  doctor: {
    username: string;
    name: string;
    email: string;
    phone: string;
  };
  patient: {
    username: string;
    name: string;
    email: string;
    phone: string;
  };
  presenceMap: {
    [username: string]: {
      presence: Presence;
      modifiedTimestamp: Date;
    };
  };
  // When deleting this channel, use "sfnExecutionArn" to stop the state machine execution
  // scheduled for sending an SMS message.
  sfnExecutionArn?: string;
}

export interface UpdateChannelMetadata extends ChannelMetadata {
  // Suppose you open two or multiple browser tabs signing in to the same user.
  // 1. In one browser tab, you send a channel message with a client ID to delete a channel and leave the chat UI.
  //    You ignore UPDATE_CHANNEL from the messaging session (WebSocket) in this tab.
  // 2. In the other browser tab, you must handle UPDATE_CHANNEL with a different client ID to leave the chat UI.
  clientId: string;
}

export interface MessageMetadata {
  // Suppose you open two or multiple browser tabs signing in to the same user.
  // 1. In one browser tab, you send a channel message with a client ID and instantly render a chat bubble UI.
  // 2. In the other browser tab, you must handle SEND_CHANNEL_MESSAGE from the messaging session (WebSocket)
  //    with a different client ID to render a chat bubble UI.
  clientId: string;
  isMeetingInvitation?: boolean;
  meetingId?: string;
  meetingInviteStatus?: MeetingInviteStatus;
  presence?: Presence;
  temporaryId?: string;
}

export interface PresenceContent {
  presence: Presence;
}

export interface ChannelMember {
  username: string;
  name: string;
  email: string;
  phone: string;
}

export interface Channel {
  appointmentTimestamp: Date;
  doctor: ChannelMember;
  patient: ChannelMember;
  presenceMap: {
    [username: string]: {
      presence: Presence;
      modifiedTimestamp: Date;
    };
  };
  summary: ChannelSummary;
  sfnExecutionArn?: string;
}

export interface MeetingAPI {
  createMeeting: (channel: Channel) => Promise<MeetingAPIResponse>;
  createAttendee: (channel: Channel, meetingId: string) => Promise<MeetingAPIResponse>;
}

export interface MeetingAPIResponse {
  Meeting: any;
  Attendee: any;
}

export interface CognitoUser {
  username: string;
  attributes: {
    sub: string;
    email_verified: string;
    name: string;
    phone_number_verified: string;
    'custom:accountType': string;
    phone_number: string;
    email: string;
  };
}
