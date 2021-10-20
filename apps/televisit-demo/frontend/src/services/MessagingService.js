/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

<<<<<<< HEAD
import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
=======
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  LogLevel,
  ConsoleLogger,
  DefaultMessagingSession,
<<<<<<< HEAD
  MessagingSessionConfiguration,
} from "amazon-chime-sdk-js";

import { getMessagingSessionEndpoint, createMemberArn } from "../api/ChimeAPI";

class MessagingService {
  constructor() {
    this._session;
    this.sessionId = uuid();
    this._logger = new ConsoleLogger("SDK Chat Demo", LogLevel.INFO);
=======
  MessagingSessionConfiguration
} from 'amazon-chime-sdk-js';

import { getMessagingSessionEndpoint, createMemberArn } from '../api/ChimeAPI';

class MessagingService {
  constructor () {
    this._session;
    this.sessionId = uuid();
    this._logger = new ConsoleLogger('SDK Chat Demo', LogLevel.INFO);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    this._messageUpdateCallbacks = [];
  }

  messageObserver = {
    messagingSessionDidStart: () => {
<<<<<<< HEAD
      console.log("Messaging Connection started!");
    },
    messagingSessionDidStartConnecting: (reconnecting) => {
      console.log("Messaging Connection connecting");
    },
    messagingSessionDidStop: (event) => {
      console.log("Messaging Connection received DidStop event");
    },
    messagingSessionDidReceiveMessage: (message) => {
      console.log("Messaging Connection received message");
      this.publishMessageUpdate(message);
    },
  };

  setMessagingEndpoint(member) {
    getMessagingSessionEndpoint()
      .then(async (response) => {
=======
      console.log('Messaging Connection started!');
    },
    messagingSessionDidStartConnecting: reconnecting => {
      console.log('Messaging Connection connecting');
    },
    messagingSessionDidStop: event => {
      console.log('Messaging Connection received DidStop event');
    },
    messagingSessionDidReceiveMessage: message => {
      console.log('Messaging Connection received message');
      this.publishMessageUpdate(message);
    }
  };

  setMessagingEndpoint (member) {
    getMessagingSessionEndpoint()
      .then(async response => {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        this._endpoint = response?.Endpoint?.Url;

        const sessionConfig = new MessagingSessionConfiguration(
          createMemberArn(member.userId),
          this.sessionId,
          this._endpoint,
          new AWS.Chime(),
          AWS
        );

        this._session = new DefaultMessagingSession(
          sessionConfig,
          this._logger
        );

        this._session.addObserver(this.messageObserver);
        this._session.start();
      })
<<<<<<< HEAD
      .catch((err) => {
=======
      .catch(err => {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        console.error(err);
      });
  }

<<<<<<< HEAD
  connect(member) {
    this.setMessagingEndpoint(member);
  }

  close() {
    try {
      this._session.stop();
    } catch (err) {
      console.error("Failed to stop Messaging Session.");
    }
  }

  subscribeToMessageUpdate(callback) {
    console.log("Message listener subscribed!");
    this._messageUpdateCallbacks.push(callback);
  }

  unsubscribeFromMessageUpdate(callback) {
=======
  connect (member) {
    this.setMessagingEndpoint(member);
  }

  close () {
    try {
      this._session.stop();
    } catch (err) {
      console.error('Failed to stop Messaging Session.');
    }
  }

  subscribeToMessageUpdate (callback) {
    console.log('Message listener subscribed!');
    this._messageUpdateCallbacks.push(callback);
  }

  unsubscribeFromMessageUpdate (callback) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    const index = this._messageUpdateCallbacks.indexOf(callback);
    if (index !== -1) {
      this._messageUpdateCallbacks.splice(index, 1);
    }
  }

<<<<<<< HEAD
  publishMessageUpdate(message) {
    console.log("Sending message update to listeners!");
=======
  publishMessageUpdate (message) {
    console.log('Sending message update to listeners!');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    for (let i = 0; i < this._messageUpdateCallbacks.length; i += 1) {
      const callback = this._messageUpdateCallbacks[i];
      callback(message);
    }
  }
}

export default MessagingService;
