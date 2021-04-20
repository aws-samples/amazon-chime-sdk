/* eslint-disable no-console */
// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as AWS from 'aws-sdk/global';
import appConfig from '../Config';

const Chime = require('aws-sdk/clients/chime');

const chimeClient = {
  client: undefined,
  awsClient: undefined,

  async setAWSConfig(awsCreds) {
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = new AWS.Credentials(
      awsCreds.AccessKeyId,
      awsCreds.SecretAccessKey,
      awsCreds.SessionToken
    );
    return new Promise((resolve) => {
      AWS.config.credentials.get(() => {
        resolve(AWS);
      });
    });
  },

  async setupChimeClient(awsCreds) {
    this.awsClient = await this.setAWSConfig(awsCreds);
    this.client = new Chime({
      region: 'us-east-1',
    });
  },
};

export const createMemberArn = (userId) =>
  `${appConfig.appInstanceArn}/user/${userId}`;

async function getMessagingSessionEndpoint() {
  const response = await chimeClient.client.getMessagingSessionEndpoint().promise();
  return response;
}

async function sendChannelMessage(
  channelArn,
  messageContent,
  member,
  options = null
) {
  console.log('sendChannelMessage called');

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: createMemberArn(member.userId),
    Content: messageContent,
    Persistence: 'PERSISTENT', // Allowed types are PERSISTENT and NON_PERSISTENT
    Type: 'STANDARD', // Allowed types are STANDARD and CONTROL
  };
  if (options && options.Metadata) {
    params.Metadata = options.Metadata;
  }

  const response = await chimeClient.client.sendChannelMessage(params).promise();
  const sentMessage = {
    response: response,
    CreatedTimestamp: new Date(),
    Sender: { Arn: createMemberArn(member.userId), Name: member.username },
  };
  return sentMessage;
}

async function listChannelMessages(channelArn, userId, nextToken = null) {
  console.log('listChannelMessages called');

  const params = {
    ChannelArn: channelArn,
    ChimeBearer: createMemberArn(userId),
    NextToken: nextToken,
  };

  const response = await chimeClient.client.listChannelMessages(params).promise();
  let posSentimentCnt = 0;
  let negSentimentCnt = 0;
  let messages = [];
  console.log(response);
  if (response.ChannelMessages) {
    const messageList = response.ChannelMessages.filter((m) => {
      if (m.Type === 'CONTROL') {
        try {
          const content = JSON.parse(m.Content);
          if (content?.sentiment) {
            content.sentiment === 'POSITIVE'
              ? (posSentimentCnt += 1)
              : (negSentimentCnt += 1);
          }
        } catch (error) {
          console.error(error);
        }
        return false;
      }
      return true;
    });
    messageList.sort((a, b) => a.CreatedTimestamp - b.CreatedTimestamp);

    messages = [...messageList];
  }
  return {
    Messages: messages,
    NextToken: response.NextToken,
    positiveCnt: posSentimentCnt,
    negativeCnt: negSentimentCnt,
  };
}

export {
  sendChannelMessage,
  listChannelMessages,
  getMessagingSessionEndpoint,
  chimeClient,
};
