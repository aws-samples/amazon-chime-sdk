const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
<<<<<<< HEAD
const { CHIME_APP_INSTANCE_ARN, CHIME_APP_INSTANCE_ADMIN_ROLE_ARN } =
  process.env;
=======
const { CHIME_APP_INSTANCE_ARN, CHIME_APP_INSTANCE_ADMIN_ROLE_ARN } = process.env;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
const appInstanceUserArnHeader = "x-amz-chime-bearer";
const appInstanceAdminRoleArn = CHIME_APP_INSTANCE_ADMIN_ROLE_ARN;
const roleSessionName = "LambdaAssumeModeratorBotAppInstanceAdminRole";

<<<<<<< HEAD
const createMemberArn = (userId) => CHIME_APP_INSTANCE_ARN + `/user/${userId}`;
=======
const createMemberArn = userId =>
  CHIME_APP_INSTANCE_ARN + `/user/${userId}`;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

async function chimeClient(uid = "LambdaAppInstanceAdminRole") {
  try {
    const sts = new AWS.STS({ region: process.env.REGION });
    const stsParams = {
      RoleArn: appInstanceAdminRoleArn,
      RoleSessionName: roleSessionName,
      Tags: [
        {
<<<<<<< HEAD
          Key: "username" /* required */,
          Value: uid /* required */,
=======
          Key: "username", /* required */
          Value: uid /* required */
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        },
        /* more items */
      ],
    };
    const assumedRole = await sts.assumeRole(stsParams).promise();
<<<<<<< HEAD
    console.log(
      "Changed Credentials: " + JSON.stringify(assumedRole.AssumedRoleUser)
    );

=======
    console.log("Changed Credentials: "+JSON.stringify(assumedRole.AssumedRoleUser));
    
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    const accessParams = {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    };

    const chime = await new AWS.Chime(accessParams);
    return chime;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function getMessagingSessionEndpoint() {
  try {
    const request = (await chimeClient()).getMessagingSessionEndpoint();
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}
/**
 * Function to send channel message
 * @param {channelArn} string Channel Arn
 * @param {messageContent} string Message content
 * @param {member} string Chime channel member
 * @param {options{}} object Additional attributes for the request object.
 * @returns {object} sendMessage object;
 */
async function sendChannelMessage(
  channelArn,
  messageContent,
  member,
  options = null,
  type = "STANDARD"
) {
<<<<<<< HEAD
  console.log("sendChannelMessage called");
=======
  console.log('sendChannelMessage called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  try {
    const params = {
      ChannelArn: channelArn,
      Content: messageContent,
<<<<<<< HEAD
      Persistence: "PERSISTENT", // Allowed types are PERSISTENT and NON_PERSISTENT
      Type: type, // Allowed types are STANDARD and CONTROL
      ChimeBearer: createMemberArn(member),
=======
      Persistence: 'PERSISTENT', // Allowed types are PERSISTENT and NON_PERSISTENT
      Type: type, // Allowed types are STANDARD and CONTROL
      ChimeBearer: createMemberArn( member )
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };
    if (options) {
      params.Metadata = options;
    }

    const response = (await chimeClient()).sendChannelMessage(params).promise();
    const sentMessage = {
      response: response,
      CreatedTimestamp: new Date(),
<<<<<<< HEAD
      Sender: { Arn: createMemberArn(member) },
=======
      Sender: { Arn: createMemberArn(member) }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    };
    return sentMessage;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

<<<<<<< HEAD
async function listChannelMessages(
  channelArn,
  userId,
  notAfter = null,
  notBefore = null,
  nextToken = null
) {
  console.log("listChannelMessages called");
=======
async function listChannelMessages(channelArn, userId, notAfter = null, notBefore = null, nextToken = null) {
  console.log('listChannelMessages called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    NotAfter: notAfter,
    NotBefore: notBefore,
    NextToken: nextToken,
<<<<<<< HEAD
    ChimeBearer: createMemberArn(userId),
=======
    ChimeBearer: createMemberArn(userId)
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).listChannelMessages(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    const messageList = response.ChannelMessages;
    messageList.sort(function (a, b) {
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
    });
    const response = await request.promise();
    const messageList = response.ChannelMessages;
    messageList.sort(function(a, b) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      return a.CreatedTimestamp < b.CreatedTimestamp
        ? -1
        : a.CreatedTimestamp > b.CreatedTimestamp
        ? 1
        : 0;
    });

    return { Messages: messageList, NextToken: response.NextToken };
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function createChannelMembership(channelArn, memberArn, userId) {
<<<<<<< HEAD
  console.log("createChannelMembership called");
=======
  console.log('createChannelMembership called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
<<<<<<< HEAD
    Type: "DEFAULT", // OPTIONS ARE: DEFAULT and HIDDEN
=======
    Type: 'DEFAULT' // OPTIONS ARE: DEFAULT and HIDDEN
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).createChannelMembership(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response.Member;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannelMembership(channelArn, memberArn, userId) {
<<<<<<< HEAD
  console.log("deleteChannelMembership called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
=======
  console.log('deleteChannelMembership called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).deleteChannelMembership(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function createChannelBan(channelArn, memberArn, userId) {
<<<<<<< HEAD
  console.log("createChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
=======
  console.log('createChannelBan called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).createChannelBan(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannelBan(channelArn, memberArn, userId) {
<<<<<<< HEAD
  console.log("deleteChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
=======
  console.log('deleteChannelBan called');

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).deleteChannelBan(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelBans(channelArn, maxResults, nextToken, userId) {
<<<<<<< HEAD
  console.log("listChannelBans called");
=======
  console.log('listChannelBans called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    MaxResults: maxResults,
<<<<<<< HEAD
    NextToken: nextToken,
=======
    NextToken: nextToken
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).listChannelBans(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    console.log("listChannelBans response", response);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
    });
    const response = await request.promise();
    console.log('listChannelBans response', response);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelMemberships(channelArn, userId) {
<<<<<<< HEAD
  console.log("listChannelMemberships called");
  const params = {
    ChannelArn: channelArn,
=======
  console.log('listChannelMemberships called');
  const params = {
    ChannelArn: channelArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).listChannelMemberships(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response.ChannelMemberships;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function createChannel(appInstanceArn, name, mode, privacy, userId) {
<<<<<<< HEAD
  console.log("createChannel called");
=======
  console.log('createChannel called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const params = {
    AppInstanceArn: appInstanceArn,
    Name: name,
    Mode: mode,
<<<<<<< HEAD
    Privacy: privacy,
  };

  try {
    const request = (await chimeClient()).createChannel(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    Privacy: privacy
  };
  
  try {
    const request = (await chimeClient()).createChannel(params);
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response.ChannelArn;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function describeChannel(channelArn, userId) {
<<<<<<< HEAD
  console.log("describeChannel called");

  const params = {
    ChannelArn: channelArn,
=======
  console.log('describeChannel called');

  const params = {
    ChannelArn: channelArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).describeChannel(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response.Channel;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function updateChannel(channelArn, name, mode, userId) {
<<<<<<< HEAD
  console.log("updateChannel called");
=======
  console.log('updateChannel called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const params = {
    ChannelArn: channelArn,
    Name: name,
<<<<<<< HEAD
    Mode: mode,
=======
    Mode: mode
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).updateChannel(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    console.log("response", response);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
    });
    const response = await request.promise();
    console.log('response', response);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelMembershipsForAppInstanceUser(userId) {
<<<<<<< HEAD
  console.log("listChannelMembershipsForAppInstanceUser called");

=======
  console.log('listChannelMembershipsForAppInstanceUser called');
  
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  try {
    const request = (
      await chimeClient()
    ).listChannelMembershipsForAppInstanceUser();
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    const channels = response.ChannelMemberships;
    return channels;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannels(appInstanceArn, userId) {
<<<<<<< HEAD
  console.log("listChannels called");
  const params = {
    AppInstanceArn: appInstanceArn,
=======
  console.log('listChannels called');
  const params = {
    AppInstanceArn: appInstanceArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).listChannels(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    const channels = response.Channels;
    return channels;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelsForAppInstanceUser(userId) {
<<<<<<< HEAD
  console.log("listChannelsForAppInstanceUser called");

  try {
    const request = (await chimeClient()).listChannelsForAppInstanceUser();
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    const channels = response.Channels;
    console.log("channels", channels);
=======
  console.log('listChannelsForAppInstanceUser called');

  try {
    const request = (await chimeClient()).listChannelsForAppInstanceUser();
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
    });
    const response = await request.promise();
    const channels = response.Channels;
    console.log('channels', channels);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    return channels;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannel(channelArn, userId) {
<<<<<<< HEAD
  console.log("deleteChannel called");

  const params = {
    ChannelArn: channelArn,
=======
  console.log('deleteChannel called');

  const params = {
    ChannelArn: channelArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).deleteChannel(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    await request.promise();
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelModerators(channelArn, userId) {
<<<<<<< HEAD
  console.log("listChannelModerators called");
  const params = {
    ChannelArn: channelArn,
=======
  console.log('listChannelModerators called');
  const params = {
    ChannelArn: channelArn
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).listChannelModerators(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
    const response = await request.promise();
    return response ? response.ChannelModerators : null;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function updateChannelMessage(
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
=======
    Metadata: metadata
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient(userId)).updateChannelMessage(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });

    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function redactChannelMessage(channelArn, messageId, userId) {
<<<<<<< HEAD
  console.log("redactChannelMessage called");
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
=======
  console.log('redactChannelMessage called');
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  try {
    const request = (await chimeClient()).redactChannelMessage(params);
<<<<<<< HEAD
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });

    const response = await request.promise();
    console.log("response", response);
=======
    request.on('build', function() {
      request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
        userId
      );
    });

    const response = await request.promise();
    console.log('response', response);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

function parseArn(arn) {
  const segments = arn.split(":");
<<<<<<< HEAD
  if (segments.length < 6 || segments[0] !== "arn")
    throw new Error("Malformed ARN");
=======
  if (segments.length < 6 || segments[0] !== "arn") throw new Error("Malformed ARN");
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const [
    ,
    //Skip "arn" literal
    partition,
    service,
    region,
    accountId,
    ...resource
  ] = segments;

  return {
    partition,
    service,
    region,
    accountId,
    resource: resource.join(":"),
  };
}

module.exports = {
  createMemberArn,
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
<<<<<<< HEAD
  parseArn,
};
=======
  parseArn
};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
