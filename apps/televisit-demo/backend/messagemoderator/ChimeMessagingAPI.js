const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const { CHIME_APP_INSTANCE_ARN, CHIME_APP_INSTANCE_ADMIN_ROLE_ARN } =
  process.env;
const appInstanceUserArnHeader = "x-amz-chime-bearer";
const appInstanceAdminRoleArn = CHIME_APP_INSTANCE_ADMIN_ROLE_ARN;
const roleSessionName = "LambdaAssumeModeratorBotAppInstanceAdminRole";

const createMemberArn = (userId) => CHIME_APP_INSTANCE_ARN + `/user/${userId}`;

async function chimeClient(uid = "LambdaAppInstanceAdminRole") {
  try {
    const sts = new AWS.STS({ region: process.env.REGION });
    const stsParams = {
      RoleArn: appInstanceAdminRoleArn,
      RoleSessionName: roleSessionName,
      Tags: [
        {
          Key: "username" /* required */,
          Value: uid /* required */,
        },
        /* more items */
      ],
    };
    const assumedRole = await sts.assumeRole(stsParams).promise();
    console.log(
      "Changed Credentials: " + JSON.stringify(assumedRole.AssumedRoleUser)
    );

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
  console.log("sendChannelMessage called");

  try {
    const params = {
      ChannelArn: channelArn,
      Content: messageContent,
      Persistence: "PERSISTENT", // Allowed types are PERSISTENT and NON_PERSISTENT
      Type: type, // Allowed types are STANDARD and CONTROL
      ChimeBearer: createMemberArn(member),
    };
    if (options) {
      params.Metadata = options;
    }

    const response = (await chimeClient()).sendChannelMessage(params).promise();
    const sentMessage = {
      response: response,
      CreatedTimestamp: new Date(),
      Sender: { Arn: createMemberArn(member) },
    };
    return sentMessage;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelMessages(
  channelArn,
  userId,
  notAfter = null,
  notBefore = null,
  nextToken = null
) {
  console.log("listChannelMessages called");

  const params = {
    ChannelArn: channelArn,
    NotAfter: notAfter,
    NotBefore: notBefore,
    NextToken: nextToken,
    ChimeBearer: createMemberArn(userId),
  };

  try {
    const request = (await chimeClient()).listChannelMessages(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    const messageList = response.ChannelMessages;
    messageList.sort(function (a, b) {
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
  console.log("createChannelMembership called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
    Type: "DEFAULT", // OPTIONS ARE: DEFAULT and HIDDEN
  };

  try {
    const request = (await chimeClient()).createChannelMembership(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response.Member;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannelMembership(channelArn, memberArn, userId) {
  console.log("deleteChannelMembership called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  try {
    const request = (await chimeClient()).deleteChannelMembership(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function createChannelBan(channelArn, memberArn, userId) {
  console.log("createChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  try {
    const request = (await chimeClient()).createChannelBan(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannelBan(channelArn, memberArn, userId) {
  console.log("deleteChannelBan called");

  const params = {
    ChannelArn: channelArn,
    MemberArn: memberArn,
  };

  try {
    const request = (await chimeClient()).deleteChannelBan(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelBans(channelArn, maxResults, nextToken, userId) {
  console.log("listChannelBans called");

  const params = {
    ChannelArn: channelArn,
    MaxResults: maxResults,
    NextToken: nextToken,
  };

  try {
    const request = (await chimeClient()).listChannelBans(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    console.log("listChannelBans response", response);
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelMemberships(channelArn, userId) {
  console.log("listChannelMemberships called");
  const params = {
    ChannelArn: channelArn,
  };

  try {
    const request = (await chimeClient()).listChannelMemberships(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response.ChannelMemberships;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function createChannel(appInstanceArn, name, mode, privacy, userId) {
  console.log("createChannel called");
  const params = {
    AppInstanceArn: appInstanceArn,
    Name: name,
    Mode: mode,
    Privacy: privacy,
  };

  try {
    const request = (await chimeClient()).createChannel(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response.ChannelArn;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function describeChannel(channelArn, userId) {
  console.log("describeChannel called");

  const params = {
    ChannelArn: channelArn,
  };

  try {
    const request = (await chimeClient()).describeChannel(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    return response.Channel;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function updateChannel(channelArn, name, mode, userId) {
  console.log("updateChannel called");

  const params = {
    ChannelArn: channelArn,
    Name: name,
    Mode: mode,
  };

  try {
    const request = (await chimeClient()).updateChannel(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    const response = await request.promise();
    console.log("response", response);
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelMembershipsForAppInstanceUser(userId) {
  console.log("listChannelMembershipsForAppInstanceUser called");

  try {
    const request = (
      await chimeClient()
    ).listChannelMembershipsForAppInstanceUser();
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
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
  console.log("listChannels called");
  const params = {
    AppInstanceArn: appInstanceArn,
  };

  try {
    const request = (await chimeClient()).listChannels(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
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
    return channels;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function deleteChannel(channelArn, userId) {
  console.log("deleteChannel called");

  const params = {
    ChannelArn: channelArn,
  };

  try {
    const request = (await chimeClient()).deleteChannel(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });
    await request.promise();
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function listChannelModerators(channelArn, userId) {
  console.log("listChannelModerators called");
  const params = {
    ChannelArn: channelArn,
  };

  try {
    const request = (await chimeClient()).listChannelModerators(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
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
  console.log("updateChannelMessage called");
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
    Content: content,
    Metadata: metadata,
  };

  try {
    const request = (await chimeClient(userId)).updateChannelMessage(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });

    const response = await request.promise();
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

async function redactChannelMessage(channelArn, messageId, userId) {
  console.log("redactChannelMessage called");
  const params = {
    ChannelArn: channelArn,
    MessageId: messageId,
  };

  try {
    const request = (await chimeClient()).redactChannelMessage(params);
    request.on("build", function () {
      request.httpRequest.headers[appInstanceUserArnHeader] =
        createMemberArn(userId);
    });

    const response = await request.promise();
    console.log("response", response);
    return response;
  } catch (e) {
    console.log(JSON.stringify(e));
    return null;
  }
}

function parseArn(arn) {
  const segments = arn.split(":");
  if (segments.length < 6 || segments[0] !== "arn")
    throw new Error("Malformed ARN");
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
  parseArn,
};
