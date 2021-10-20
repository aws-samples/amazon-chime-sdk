/* eslint-disable no-plusplus */
/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

<<<<<<< HEAD
import routes from "../constants/routes";
import appConfig from "../Config";
// eslint-disable-next-line no-unused-vars
const Chime = require("aws-sdk/clients/chime");

export const BASE_URL = routes.SIGNIN;
export const createMemberArn = (userId) =>
  `${appConfig.appInstanceArn}/user/${userId}`;

const appInstanceUserArnHeader = "x-amz-chime-bearer";
=======
import routes from '../constants/routes';
import appConfig from '../Config';
// eslint-disable-next-line no-unused-vars
const Chime = require('aws-sdk/clients/chime');

export const BASE_URL = routes.SIGNIN;
export const createMemberArn = userId =>
  `${appConfig.appInstanceArn}/user/${userId}`;

const appInstanceUserArnHeader = 'x-amz-chime-bearer';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

let chime = null;

// Setup Chime Client lazily
<<<<<<< HEAD
async function chimeClient() {
=======
async function chimeClient () {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  if (chime == null) {
    chime = new Chime();
  }
  return chime;
}

<<<<<<< HEAD
async function getMessagingSessionEndpoint() {
=======
async function getMessagingSessionEndpoint () {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const request = (await chimeClient()).getMessagingSessionEndpoint();
  const response = await request.promise();
  return response;
}
/**
 * Function to send channel message
 * @param {channelArn} string Channel Arn
 * @param {messageContent} string Message content
 * @param {member} string Chime channel member
 * @param {options{}} object Additional attributes for the request object.
 * @returns {object} sendMessage object;
 */
<<<<<<< HEAD
async function sendChannelMessage(
=======
async function sendChannelMessage (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  channelArn,
  messageContent,
  persistence,
  member,
  options = null
) {
<<<<<<< HEAD
  console.log("sendChannelMessage called");
=======
  console.log('sendChannelMessage called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    Content: messageContent,
    Persistence: persistence, // Allowed types are PERSISTENT and NON_PERSISTENT
<<<<<<< HEAD
    Type: "STANDARD", // Allowed types are STANDARD and CONTROL
=======
    Type: 'STANDARD' // Allowed types are STANDARD and CONTROL
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };
  if (options && options.Metadata) {
    params.Metadata = options.Metadata;
  }

  const request = (await chimeClient()).sendChannelMessage(params);
<<<<<<< HEAD
  request.on("build", function () {
=======
  request.on('build', function () {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      member.userId
    );
  });
  const response = await request.promise();
  const sentMessage = {
    response: response,
    CreatedTimestamp: new Date(),
<<<<<<< HEAD
    Sender: { Arn: createMemberArn(member.userId), Name: member.username },
=======
    Sender: { Arn: createMemberArn(member.userId), Name: member.username }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };
  return sentMessage;
}

<<<<<<< HEAD
async function listChannelMessages(channelArn, userId, nextToken = null) {
  console.log("listChannelMessages called");

  const params = {
    ChannelArn: channelArn,
    NextToken: nextToken,
  };

  const request = (await chimeClient()).listChannelMessages(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function listChannelMessages (channelArn, userId, nextToken = null) {
  console.log('listChannelMessages called');

  const params = {
    ChannelArn: channelArn,
    NextToken: nextToken
  };

  const request = (await chimeClient()).listChannelMessages(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  const messageList = response.ChannelMessages;
  messageList.sort(function (a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a.CreatedTimestamp < b.CreatedTimestamp
      ? -1
      : a.CreatedTimestamp > b.CreatedTimestamp
<<<<<<< HEAD
      ? 1
      : 0;
=======
        ? 1
        : 0;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });

  const messages = [];
  for (let i = 0; i < messageList.length; i++) {
    const message = messageList[i];
    messages.push(message);
  }
  return { Messages: messages, NextToken: response.NextToken };
}

<<<<<<< HEAD
async function listAppInstanceUsers(appInstanceArn, userId, nextToken = null) {
  console.log("listAppInstanceUsers called");
  const params = {
    AppInstanceArn: appInstanceArn,
    NextToken: nextToken,
  };

  const request = (await chimeClient()).listAppInstanceUsers(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function listAppInstanceUsers (appInstanceArn, userId, nextToken = null) {
  console.log('listAppInstanceUsers called');
  const params = {
    AppInstanceArn: appInstanceArn,
    NextToken: nextToken
  };

  const request = (await chimeClient()).listAppInstanceUsers(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response.AppInstanceUsers;
}

<<<<<<< HEAD
async function createChannelMembership(channelArn, memberArn, userId) {
  console.log("createChannelMembership called");
=======
async function createChannelMembership (channelArn, memberArn, userId) {
  console.log('createChannelMembership called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
<<<<<<< HEAD
    Type: "DEFAULT", // OPTIONS ARE: DEFAULT and HIDDEN
  };

  const request = (await chimeClient()).createChannelMembership(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
    Type: 'DEFAULT' // OPTIONS ARE: DEFAULT and HIDDEN
  };

  const request = (await chimeClient()).createChannelMembership(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response.Member;
}

<<<<<<< HEAD
async function deleteChannelMembership(channelArn, memberArn, userId) {
  console.log("deleteChannelMembership called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  const request = (await chimeClient()).deleteChannelMembership(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function deleteChannelMembership (channelArn, memberArn, userId) {
  console.log('deleteChannelMembership called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
  };

  const request = (await chimeClient()).deleteChannelMembership(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response;
}

<<<<<<< HEAD
async function createChannelBan(channelArn, memberArn, userId) {
  console.log("createChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  const request = (await chimeClient()).createChannelBan(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function createChannelBan (channelArn, memberArn, userId) {
  console.log('createChannelBan called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
  };

  const request = (await chimeClient()).createChannelBan(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response;
}

<<<<<<< HEAD
async function deleteChannelBan(channelArn, memberArn, userId) {
  console.log("deleteChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  const request = (await chimeClient()).deleteChannelBan(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function deleteChannelBan (channelArn, memberArn, userId) {
  console.log('deleteChannelBan called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
  };

  const request = (await chimeClient()).deleteChannelBan(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response;
}

<<<<<<< HEAD
async function listChannelBans(channelArn, maxResults, nextToken, userId) {
  console.log("listChannelBans called");
=======
async function listChannelBans (channelArn, maxResults, nextToken, userId) {
  console.log('listChannelBans called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    MaxResults: maxResults,
<<<<<<< HEAD
    NextToken: nextToken,
  };

  const request = (await chimeClient()).listChannelBans(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
  });
  const response = await request.promise();
  console.log("listChannelBans response", response);
  return response;
}

async function listChannelMemberships(channelArn, userId) {
  console.log("listChannelMemberships called");
  const params = {
    ChannelArn: channelArn,
  };

  const request = (await chimeClient()).listChannelMemberships(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
    NextToken: nextToken
  };

  const request = (await chimeClient()).listChannelBans(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  console.log('listChannelBans response', response);
  return response;
}

async function listChannelMemberships (channelArn, userId) {
  console.log('listChannelMemberships called');
  const params = {
    ChannelArn: channelArn
  };

  const request = (await chimeClient()).listChannelMemberships(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response.ChannelMemberships;
}

<<<<<<< HEAD
async function createChannel(
  appInstanceArn,
  metadata,
  name,
  mode,
  privacy,
  userId
) {
  console.log("createChannel called");
=======
async function createChannel (appInstanceArn, metadata, name, mode, privacy, userId) {
  console.log('createChannel called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const params = {
    AppInstanceArn: appInstanceArn,
    Metadata: metadata,
    Name: name,
    Mode: mode,
<<<<<<< HEAD
    Privacy: privacy,
  };

  const request = (await chimeClient()).createChannel(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
    Privacy: privacy
  };

  const request = (await chimeClient()).createChannel(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response.ChannelArn;
}

<<<<<<< HEAD
async function describeChannel(channelArn, userId) {
  console.log("describeChannel called");

  const params = {
    ChannelArn: channelArn,
  };

  const request = (await chimeClient()).describeChannel(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function describeChannel (channelArn, userId) {
  console.log('describeChannel called');

  const params = {
    ChannelArn: channelArn
  };

  const request = (await chimeClient()).describeChannel(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response.Channel;
}

<<<<<<< HEAD
async function updateChannel(channelArn, name, mode, metadata, userId) {
  console.log("updateChannel called");
=======
async function updateChannel (channelArn, name, mode, metadata, userId) {
  console.log('updateChannel called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    Name: name,
    Mode: mode,
<<<<<<< HEAD
    Metadata: metadata,
  };

  const request = (await chimeClient()).updateChannel(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
  });
  const response = await request.promise();
  console.log("response", response);
  return response;
}

async function listChannelMembershipsForAppInstanceUser(userId) {
  console.log("listChannelMembershipsForAppInstanceUser called");
=======
    Metadata: metadata
  };

  const request = (await chimeClient()).updateChannel(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  console.log('response', response);
  return response;
}

async function listChannelMembershipsForAppInstanceUser (userId) {
  console.log('listChannelMembershipsForAppInstanceUser called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const request = (
    await chimeClient()
  ).listChannelMembershipsForAppInstanceUser();
<<<<<<< HEAD
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  const channels = response.ChannelMemberships;
  return channels;
}

<<<<<<< HEAD
async function listChannels(appInstanceArn, userId) {
  console.log("listChannels called");
  const params = {
    AppInstanceArn: appInstanceArn,
  };

  const request = (await chimeClient()).listChannels(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function listChannels (appInstanceArn, userId) {
  console.log('listChannels called');
  const params = {
    AppInstanceArn: appInstanceArn
  };

  const request = (await chimeClient()).listChannels(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  const channels = response.Channels;
  return channels;
}

<<<<<<< HEAD
async function listChannelsForAppInstanceUser(userId) {
  console.log("listChannelsForAppInstanceUser called");

  const request = (await chimeClient()).listChannelsForAppInstanceUser();
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
  });
  const response = await request.promise();
  const channels = response.Channels;
  console.log("channels", channels);
  return channels;
}

async function deleteChannel(channelArn, userId) {
  console.log("deleteChannel called");

  const params = {
    ChannelArn: channelArn,
  };

  const request = (await chimeClient()).deleteChannel(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function listChannelsForAppInstanceUser (userId) {
  console.log('listChannelsForAppInstanceUser called');

  const request = (await chimeClient()).listChannelsForAppInstanceUser();
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  const channels = response.Channels;
  console.log('channels', channels);
  return channels;
}

async function deleteChannel (channelArn, userId) {
  console.log('deleteChannel called');

  const params = {
    ChannelArn: channelArn
  };

  const request = (await chimeClient()).deleteChannel(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  await request.promise();
}

<<<<<<< HEAD
async function listChannelModerators(channelArn, userId) {
  console.log("listChannelModerators called");
  const params = {
    ChannelArn: channelArn,
  };

  const request = (await chimeClient()).listChannelModerators(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
async function listChannelModerators (channelArn, userId) {
  console.log('listChannelModerators called');
  const params = {
    ChannelArn: channelArn
  };

  const request = (await chimeClient()).listChannelModerators(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
  const response = await request.promise();
  return response ? response.ChannelModerators : null;
}

<<<<<<< HEAD
async function updateChannelMessage(
=======
async function updateChannelMessage (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  channelArn,
  messageId,
  content,
  metadata,
  userId
) {
<<<<<<< HEAD
  console.log("updateChannelMessage called");
=======
  console.log('updateChannelMessage called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
    Content: content,
<<<<<<< HEAD
    Metadata: metadata,
  };

  const request = (await chimeClient()).updateChannelMessage(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
=======
    Metadata: metadata
  };

  const request = (await chimeClient()).updateChannelMessage(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });

  const response = await request.promise();
  return response;
}

<<<<<<< HEAD
async function redactChannelMessage(channelArn, messageId, userId) {
  console.log("redactChannelMessage called");
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
  };

  const request = (await chimeClient()).redactChannelMessage(params);
  request.on("build", function () {
    request.httpRequest.headers[appInstanceUserArnHeader] =
      createMemberArn(userId);
  });

  const response = await request.promise();
  console.log("response", response);
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
      method: "POST",
=======
async function redactChannelMessage (channelArn, messageId, userId) {
  console.log('redactChannelMessage called');
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId
  };

  const request = (await chimeClient()).redactChannelMessage(params);
  request.on('build', function () {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });

  const response = await request.promise();
  console.log('response', response);
  return response;
}

async function createMeeting (name, userId, channelArn) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}create?name=${encodeURIComponent(
      name
    )}&userId=${encodeURIComponent(
      userId
    )}&channel=${encodeURIComponent(
      channelArn
    )}`,
    {
      method: 'POST'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

<<<<<<< HEAD
async function startTranscription(meetingId) {
=======
async function startTranscription (meetingId) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}transcript?meetingId=${encodeURIComponent(
      meetingId
    )}`,
    {
<<<<<<< HEAD
      method: "POST",
=======
      method: 'POST'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

<<<<<<< HEAD
async function createAttendee(name, userId, channelArn, meeting) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}join?name=${encodeURIComponent(
      name
    )}&userId=${encodeURIComponent(userId)}&channel=${encodeURIComponent(
      channelArn
    )}&meeting=${encodeURIComponent(meeting)}`,
    {
      method: "POST",
=======
async function createAttendee (name, userId, channelArn, meeting) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}join?name=${encodeURIComponent(
      name
    )}&userId=${encodeURIComponent(
      userId
    )}&channel=${encodeURIComponent(
      channelArn
    )}&meeting=${encodeURIComponent(
      meeting
    )}`,
    {
      method: 'POST'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

<<<<<<< HEAD
function createGetAttendeeCallback() {
  return async (chimeAttendeeId, externalUserId) => {
    return {
      name: externalUserId,
=======
function createGetAttendeeCallback () {
  return async (chimeAttendeeId, externalUserId) => {
    return {
      name: externalUserId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };
  };
}

<<<<<<< HEAD
async function endMeeting(meetingId) {
  const res = await fetch(
    `${appConfig.apiGatewayInvokeUrl}end?meetingId=${encodeURIComponent(
      meetingId
    )}`,
    {
      method: "POST",
=======
async function endMeeting (meetingId) {
  const res = await fetch(
    `${appConfig.apiGatewayInvokeUrl}end?meetingId=${encodeURIComponent(meetingId)}`,
    {
      method: 'POST'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  );

  if (!res.ok) {
<<<<<<< HEAD
    throw new Error("Server error ending meeting");
  }
}

async function startMeetingRecording(meetingId) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}startrecord?meetingId=${encodeURIComponent(
      meetingId
    )}`,
    {
      method: "POST",
=======
    throw new Error('Server error ending meeting');
  }
}

async function startMeetingRecording (meetingId) {
  const response = await fetch(
    `${appConfig.apiGatewayInvokeUrl}startrecord?meetingId=${encodeURIComponent(meetingId)}`,
    {
      method: 'POST'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

<<<<<<< HEAD
async function stopMeetingRecording(mediapipelineid) {
  const res = await fetch(
    `${
      appConfig.apiGatewayInvokeUrl
    }stoprecord?mediapipelineid=${encodeURIComponent(mediapipelineid)}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    throw new Error("Server error stop recording");
=======
async function stopMeetingRecording (mediapipelineid) {
  const res = await fetch(
    `${appConfig.apiGatewayInvokeUrl}stoprecord?mediapipelineid=${encodeURIComponent(mediapipelineid)}`,
    {
      method: 'POST'
    }
  );
  if (!res.ok) {
    throw new Error('Server error stop recording');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  }
}

export {
  sendChannelMessage,
  listChannelMessages,
  createChannelMembership,
  listChannelMemberships,
  deleteChannelMembership,
  createChannelBan,
  deleteChannelBan,
  listChannelBans,
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
  listAppInstanceUsers,
  createMeeting,
  startTranscription,
  createAttendee,
  createGetAttendeeCallback,
  endMeeting,
  startMeetingRecording,
<<<<<<< HEAD
  stopMeetingRecording,
=======
  stopMeetingRecording
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
};
