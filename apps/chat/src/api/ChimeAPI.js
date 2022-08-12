/* eslint-disable no-plusplus */
/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import routes from '../constants/routes';
import appConfig from '../Config';
// eslint-disable-next-line no-unused-vars
const ChimeIdentity = require('aws-sdk/clients/chimesdkidentity');
const ChimeMessaging = require('aws-sdk/clients/chimesdkmessaging');

export const BASE_URL = routes.SIGNIN;
export const createMemberArn = (userId) =>
  `${appConfig.appInstanceArn}/user/${userId}`;

export const Persistence = {
  PERSISTENT: 'PERSISTENT',
  NON_PERSISTENT: 'NON_PERSISTENT',
};

export const MessageType = {
  STANDARD: 'STANDARD',
  CONTROL: 'CONTROL',
};

const appInstanceUserArnHeader = 'x-amz-chime-bearer';

let chimeMessaging = null;
let chimeIdentity = null;

// Setup Chime Messaging Client lazily
async function chimeMessagingClient() {
  if (chimeMessaging == null) {
    chimeMessaging = new ChimeMessaging();
  }
  return chimeMessaging;
}

function resetAWSClients() {
  chimeMessaging = null;
  chimeIdentity = null;
}
// Setup Chime Identity Client lazily
async function chimeIdentityClient() {
  if (chimeIdentity == null) {
    chimeIdentity = new ChimeIdentity();
  }
  return chimeIdentity;
}

async function getMessagingSessionEndpoint() {
  const request = (await chimeMessagingClient()).getMessagingSessionEndpoint();
  const response = await request.promise();
  return response;
}

async function sendChannelMessage(
  channelArn,
  messageContent,
  persistence,
  type,
  member,
  subChannelId,
  options = null
) {
  console.log('sendChannelMessage called');

  const chimeBearerArn = createMemberArn(member.userId);

  const params = {
    ChimeBearer: chimeBearerArn,
    ChannelArn: channelArn,
    Content: messageContent,
    Persistence: persistence, // Allowed types are PERSISTENT and NON_PERSISTENT
    Type: type, // Allowed types are STANDARD and CONTROL
    SubChannelId: subChannelId,
  };
  if (options && options.Metadata) {
    params.Metadata = options.Metadata;
  }

  const request = (await chimeMessagingClient()).sendChannelMessage(params);
  const response = await request.promise();
  const sentMessage = {
    response: response,
    CreatedTimestamp: new Date(),
    Sender: { Arn: createMemberArn(member.userId), Name: member.username },
  };
  return sentMessage;
}

async function getChannelMessage(channelArn, member, messageId, subChannelId) {
  console.log('getChannelMessage called');

  const chimeBearerArn = createMemberArn(member.userId);

  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).getChannelMessage(params);
  const response = await request.promise();
  return response.ChannelMessage;
}

async function listChannelMessages(
  channelArn,
  userId,
  subChannelId,
  nextToken = null
) {
  console.log('listChannelMessages called');

  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    NextToken: nextToken,
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).listChannelMessages(params);
  const response = await request.promise();
  const messageList = response.ChannelMessages;
  messageList.sort(function (a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a.CreatedTimestamp < b.CreatedTimestamp
      ? -1
      : a.CreatedTimestamp > b.CreatedTimestamp
      ? 1
      : 0;
  });

  const messages = [];
  for (let i = 0; i < messageList.length; i++) {
    const message = messageList[i];
    messages.push(message);
  }
  return { Messages: messages, NextToken: response.NextToken };
}

async function listAppInstanceUsers(appInstanceArn, userId, nextToken = null) {
  console.log('listAppInstanceUsers called');
  const chimeBearerArn = createMemberArn(userId);
  const params = {
    AppInstanceArn: appInstanceArn,
    NextToken: nextToken,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeIdentityClient()).listAppInstanceUsers(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  return response.AppInstanceUsers;
}

async function createChannelMembership(
  channelArn,
  memberArn,
  userId,
  subChannelId
) {
  console.log('createChannelMembership called');
  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
    Type: 'DEFAULT', // OPTIONS ARE: DEFAULT and HIDDEN
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).createChannelMembership(
    params
  );
  const response = await request.promise();
  return response.Member;
}

async function deleteChannelMembership(channelArn, memberArn, userId, subChannelId) {
  console.log('deleteChannelMembership called');
  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).deleteChannelMembership(
    params
  );
  const response = await request.promise();
  return response;
}

async function createChannelBan(channelArn, memberArn, userId) {
  console.log('createChannelBan called');
  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).createChannelBan(params);
  const response = await request.promise();
  return response;
}

async function deleteChannelBan(channelArn, memberArn, userId) {
  console.log('deleteChannelBan called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).deleteChannelBan(params);
  const response = await request.promise();
  return response;
}

async function listChannelBans(channelArn, maxResults, nextToken, userId) {
  console.log('listChannelBans called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    MaxResults: maxResults,
    NextToken: nextToken,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).listChannelBans(params);
  const response = await request.promise();
  console.log('listChannelBans response', response);
  return response;
}

async function listChannelMemberships(channelArn, userId, subChannelId) {
  console.log('listChannelMemberships called');
  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).listChannelMemberships(params);
  const response = await request.promise();
  return response.ChannelMemberships;
}

async function associateChannelFlow(channelArn, channelFlowArn, userId) {
  console.log('associateChannelFlow called');
  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    ChannelFlowArn: channelFlowArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).associateChannelFlow(params);

  const response = await request.promise();
  console.log('associateChannelFlow response');
  console.log(response);
  return response;
}

async function disassociateChannelFlow(channelArn, channelFlowArn, userId) {
  console.log('disassociateChannelFlow called');
  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    ChannelFlowArn: channelFlowArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).disassociateChannelFlow(
    params
  );

  const response = await request.promise();
  return response;
}

async function describeChannelFlow(channelFlowArn) {
  console.log('describeChannelFlow called');
  const params = {
    ChannelFlowArn: channelFlowArn,
  };

  const request = (await chimeMessagingClient()).describeChannelFlow(params);
  const response = await request.promise();
  return response.ChannelFlow;
}

async function listChannelFlows(appInstanceArn, maxResults, nextToken) {
  console.log('listChannelFlows called');

  const params = {
    AppInstanceArn: appInstanceArn,
    MaxResults: maxResults,
    NextToken: nextToken,
  };

  const request = (await chimeMessagingClient()).listChannelFlows(params);
  const response = await request.promise();
  console.log('listChannelFlows response', response);
  return response.ChannelFlows;
}

async function createChannel(
  appInstanceArn,
  metadata,
  name,
  mode,
  privacy,
  elasticChannelConfiguration,
  userId
) {
  console.log('createChannel called');

  const chimeBearerArn = createMemberArn(userId);
  if (!metadata && privacy === 'PUBLIC') {
    const channelType = elasticChannelConfiguration ? 'PUBLIC_ELASTIC' : 'PUBLIC_STANDARD';
    metadata = JSON.stringify({ ChannelType: channelType });
  }

  const params = {
    AppInstanceArn: appInstanceArn,
    Metadata: metadata,
    Name: name,
    Mode: mode,
    Privacy: privacy,
    ChimeBearer: chimeBearerArn,
  };

  if (elasticChannelConfiguration) {
    params['ElasticChannelConfiguration'] = elasticChannelConfiguration;
  }
  const request = (await chimeMessagingClient()).createChannel(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  return response.ChannelArn;
}

async function describeChannel(channelArn, userId) {
  console.log('describeChannel called');

  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).describeChannel(params);
  const response = await request.promise();
  return response.Channel;
}

async function updateChannel(channelArn, name, mode, metadata, userId) {
  console.log('updateChannel called');

  const chimeBearerArn = createMemberArn(userId);
  console.log(chimeBearerArn);
  const params = {
    ChannelArn: channelArn,
    Name: name,
    Mode: mode,
    Metadata: metadata,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).updateChannel(params);
  const response = await request.promise();
  return response;
}

async function listChannelMembershipsForAppInstanceUser(userId) {
  console.log('listChannelMembershipsForAppInstanceUser called');

  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChimeBearer: chimeBearerArn,
  };

  const request = (
    await chimeMessagingClient()
  ).listChannelMembershipsForAppInstanceUser(params);
  const response = await request.promise();
  const channels = response.ChannelMemberships;
  return channels;
}

async function listChannels(appInstanceArn, userId) {
  console.log('listChannels called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    AppInstanceArn: appInstanceArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).listChannels(params);
  const response = await request.promise();
  const channels = response.Channels;
  return channels;
}

async function listChannelsModeratedByAppInstanceUser(userId) {
  console.log('listChannelsModeratedByAppInstanceUser called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChimeBearer: chimeBearerArn,
  };
  const request = (
    await chimeMessagingClient()
  ).listChannelsModeratedByAppInstanceUser(params);
  const response = await request.promise();
  return response.Channels;
}

async function listSubChannels(channelArn, userId) {
  console.log('listSubChannels called');
  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).listSubChannels(params);
  const response = await request.promise();
  return response;
}

async function listChannelsForAppInstanceUser(userId) {
  console.log('listChannelsForAppInstanceUser called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChimeBearer: chimeBearerArn,
  };
  const request = (await chimeMessagingClient()).listChannelsForAppInstanceUser(
    params
  );
  const response = await request.promise();
  const channels = response.Channels;
  console.log('channels', channels);
  return channels;
}

async function deleteChannel(channelArn, userId) {
  console.log('deleteChannel called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).deleteChannel(params);
  await request.promise();
}

async function listChannelModerators(channelArn, userId) {
  console.log('listChannelModerators called');
  const chimeBearerArn = createMemberArn(userId);

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: chimeBearerArn,
  };

  const request = (await chimeMessagingClient()).listChannelModerators(params);
  const response = await request.promise();
  return response ? response.ChannelModerators : null;
}

async function updateChannelMessage(
  channelArn,
  messageId,
  content,
  metadata,
  userId,
  subChannelId
) {
  console.log('updateChannelMessage called');
  const chimeBearer = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
    Content: content,
    Metadata: metadata,
    ChimeBearer: chimeBearer,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).updateChannelMessage(params);

  const response = await request.promise();
  return response;
}

async function redactChannelMessage(
  channelArn,
  messageId,
  userId,
  subChannelId
) {
  console.log('redactChannelMessage called');

  const chimeBearerArn = createMemberArn(userId);
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
    ChimeBearer: chimeBearerArn,
    SubChannelId: subChannelId,
  };

  const request = (await chimeMessagingClient()).redactChannelMessage(params);

  const response = await request.promise();
  return response;
}

async function createMeeting(name, userId, channelArn) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}create?name=${encodeURIComponent(
      name
    )}&userId=${encodeURIComponent(userId)}&channel=${encodeURIComponent(
      channelArn
    )}`,
    {
      method: 'POST',
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

async function createAttendee(name, userId, channelArn, meeting) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}join?name=${encodeURIComponent(
      name
    )}&userId=${encodeURIComponent(userId)}&channel=${encodeURIComponent(
      channelArn
    )}&meeting=${encodeURIComponent(meeting)}`,
    {
      method: 'POST',
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

function createGetAttendeeCallback() {
  return async (chimeAttendeeId, externalUserId) => {
    return {
      name: externalUserId,
    };
  };
}

async function endMeeting(meetingId) {
  const res = await fetch(
    `${appConfig.apiGatewayInvokeUrl}end?meetingId=${encodeURIComponent(
      meetingId
    )}`,
    {
      method: 'POST',
    }
  );

  if (!res.ok) {
    throw new Error('Server error ending meeting');
  }
}

export {
  associateChannelFlow,
  disassociateChannelFlow,
  describeChannelFlow,
  listChannelFlows,
  sendChannelMessage,
  getChannelMessage,
  listChannelMessages,
  createChannelMembership,
  listChannelMemberships,
  deleteChannelMembership,
  createChannelBan,
  deleteChannelBan,
  listChannelBans,
  listSubChannels,
  createChannel,
  describeChannel,
  updateChannel,
  listChannels,
  listChannelsForAppInstanceUser,
  deleteChannel,
  listChannelModerators,
  updateChannelMessage,
  redactChannelMessage,
  getMessagingSessionEndpoint,
  listChannelMembershipsForAppInstanceUser,
  listChannelsModeratedByAppInstanceUser,
  listAppInstanceUsers,
  createMeeting,
  createAttendee,
  createGetAttendeeCallback,
  endMeeting,
  resetAWSClients,
};
