/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
<<<<<<< HEAD
} from "react";

import { useAppState } from "../../providers/AppStateProvider";
import appConfig from "../../Config";
import { useAuthContext } from "../AuthProvider";
import { describeChannel, createMemberArn } from "../../api/ChimeAPI";
import MessagingService from "../../services/MessagingService";
import mergeArrayOfObjects from "../../utilities/mergeArrays";
import routes from "../../constants/routes";
=======
} from 'react';

import { useAppState } from '../../providers/AppStateProvider';
import appConfig from '../../Config';
import { useAuthContext } from '../AuthProvider';
import { describeChannel, createMemberArn } from '../../api/ChimeAPI';
import MessagingService from '../../services/MessagingService';
import mergeArrayOfObjects from '../../utilities/mergeArrays';
import routes from '../../constants/routes';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const ChatMessagingServiceContext = createContext(MessagingService);
const ChatMessagingState = createContext();
const ChatChannelState = createContext();

const MessagingProvider = ({ children }) => {
  const { member, isAuthenticated } = useAuthContext();
  const [messagingService] = useState(() => new MessagingService());
  // Channel related
  const [activeChannel, setActiveChannel] = useState({});
  const [activeChannelMemberships, setActiveChannelMemberships] = useState([]);
  const activeChannelRef = useRef(activeChannel.ChannelArn);
  const [channelList, setChannelList] = useState([]);
  const [unreadChannels, setUnreadChannels] = useState([]);
  const unreadChannelsListRef = useRef(unreadChannels);
  const hasMembership =
    activeChannelMemberships
      .map((m) => m.Member.Arn)
      .indexOf(createMemberArn(member.userId)) > -1;
  // Messages
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  const channelListRef = useRef(channelList);
  const activeChannelMembershipsRef = useRef(activeChannelMemberships);
<<<<<<< HEAD
  const [channelMessageToken, setChannelMessageToken] = useState("");
  const channelMessageTokenRef = useRef(channelMessageToken);
  // Meeting
  const [meetingInfo, setMeetingInfo] = useState("");
=======
  const [channelMessageToken, setChannelMessageToken] = useState('');
  const channelMessageTokenRef = useRef(channelMessageToken);
  // Meeting
  const [meetingInfo, setMeetingInfo] = useState('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  useEffect(() => {
    messagesRef.current = messages;
    activeChannelRef.current = activeChannel;
    channelListRef.current = channelList;
    unreadChannelsListRef.current = unreadChannels;
    activeChannelMembershipsRef.current = activeChannelMemberships;
    channelMessageTokenRef.current = channelMessageToken;
  });

  // Messaging service initiator
  useEffect(() => {
    if (!isAuthenticated) return;

    // Start messaging service
    messagingService.connect(member);

    return () => {
      messagingService.close();
    };
  }, [isAuthenticated]);

  const processChannelMessage = async (message) => {
    const promise = Promise.resolve(message);
    const newMessage = await promise.then((m) => m);

    let isDuplicate = false;

    messagesRef.current.forEach((m, i, self) => {
      if ((m.response?.MessageId || m.MessageId) === newMessage.MessageId) {
<<<<<<< HEAD
        console.log("Duplicate message found", newMessage);
=======
        console.log('Duplicate message found', newMessage);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        isDuplicate = true;
        self[i] = newMessage;
      }
    });

    let newMessages = [...messagesRef.current];

<<<<<<< HEAD
    if (!isDuplicate && newMessage.Persistence === "PERSISTENT") {
=======
    if (!isDuplicate && newMessage.Persistence === 'PERSISTENT') {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      newMessages = [...newMessages, newMessage];
    }

    setMessages(newMessages);
  };

  const messagesProcessor = async (message) => {
<<<<<<< HEAD
    const messageType = message?.headers["x-amz-chime-event-type"];
    const record = JSON.parse(message?.payload);
    console.log("Incoming Message", message);
    switch (messageType) {
      // Channel Messages
      case "CREATE_CHANNEL_MESSAGE":
      case "REDACT_CHANNEL_MESSAGE":
      case "UPDATE_CHANNEL_MESSAGE":
      case "DELETE_CHANNEL_MESSAGE":
        // Process ChannelMessage
        if (record.Metadata) {
          const metadata = JSON.parse(record.Metadata);
          if (
            metadata.isMeetingInfo &&
            record.Sender.Arn !== createMemberArn(member.userId)
          ) {
            const meetingInfo = JSON.parse(record.Content);
            setMeetingInfo(meetingInfo);
          }
        } else if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
=======
    const messageType = message?.headers['x-amz-chime-event-type'];
    const record = JSON.parse(message?.payload);
    console.log('Incoming Message', message);
    switch (messageType) {
      // Channel Messages
      case 'CREATE_CHANNEL_MESSAGE':
      case 'REDACT_CHANNEL_MESSAGE':
      case 'UPDATE_CHANNEL_MESSAGE':
      case 'DELETE_CHANNEL_MESSAGE':
        // Process ChannelMessage
        if (record.Metadata) {
          const metadata = JSON.parse(record.Metadata);
          if (metadata.isMeetingInfo && record.Sender.Arn !== createMemberArn(member.userId)) {
            const meetingInfo = JSON.parse(record.Content);
            setMeetingInfo(meetingInfo);
          };
        }
        else if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          processChannelMessage(record);
        } else {
          const findMatch = unreadChannelsListRef.current.find(
            (chArn) => chArn === record.ChannelArn
          );
          if (findMatch) return;
          const newUnreads = [
            ...unreadChannelsListRef.current,
            record.ChannelArn,
          ];
          setUnreadChannels(newUnreads);
        }
        break;
      // Channels actions
<<<<<<< HEAD
      case "CREATE_CHANNEL":
      case "UPDATE_CHANNEL":
=======
      case 'CREATE_CHANNEL':
      case 'UPDATE_CHANNEL':
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        {
          const newChannelArn = record.ChannelArn;
          const updatedChannelList = channelListRef.current.map((c) => {
            if (c.ChannelArn !== newChannelArn) {
              return c;
            }
            return record;
          });
          setChannelList(updatedChannelList);
          setActiveChannel(record);
        }
        break;
<<<<<<< HEAD
      case "DELETE_CHANNEL": {
=======
      case 'DELETE_CHANNEL': {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        setChannelList(
          channelListRef.current.filter(
            (chRef) => chRef.ChannelArn !== record.ChannelArn
          )
        );
        break;
      }
      // Channel Memberships
<<<<<<< HEAD
      case "CREATE_CHANNEL_MEMBERSHIP":
=======
      case 'CREATE_CHANNEL_MEMBERSHIP':
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        {
          const newChannel = await describeChannel(
            record.ChannelArn,
            member.userId
          );

          if (newChannel.Metadata) {
            let metadata = JSON.parse(newChannel.Metadata);
            if (metadata.isHidden) return;
          }

          const newChannelList = mergeArrayOfObjects(
            [newChannel],
            channelListRef.current,
<<<<<<< HEAD
            "ChannelArn"
=======
            'ChannelArn'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          );
          setChannelList(newChannelList);
        }
        break;
<<<<<<< HEAD
      case "UPDATE_CHANNEL_MEMBERSHIP":
=======
      case 'UPDATE_CHANNEL_MEMBERSHIP':
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        if (
          `${appConfig.appInstanceArn}/user/${member.userId}` !==
          record?.InvitedBy.Arn
        ) {
          const channel = await describeChannel(
            record?.ChannelArn,
            member.userId
          );
          const newChannelList = mergeArrayOfObjects(
            [channel],
            channelListRef.current,
<<<<<<< HEAD
            "ChannelArn"
=======
            'ChannelArn'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          );
          setChannelList(newChannelList);
        }
        break;
<<<<<<< HEAD
      case "DELETE_CHANNEL_MEMBERSHIP":
=======
      case 'DELETE_CHANNEL_MEMBERSHIP':
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        // You are removed
        if (record.Member.Arn.includes(member.userId)) {
          setChannelList(
            channelListRef.current.filter(
              (chRef) => chRef.ChannelArn !== record.ChannelArn
            )
          );
          if (activeChannelRef.current.ChannelArn === record.ChannelArn) {
            setActiveChannel({});
          }
        } else {
          // Someone else is removed
          const updatedMemberships = activeChannelMembershipsRef.current.filter(
            (m) => m.Member.Arn !== record.Member.Arn
          );
          setActiveChannelMemberships(updatedMemberships);
        }
        break;
      default:
        console.log(`Unexpected message type! ${messageType}`);
    }
  };

  // Subscribe to MessagingService for updates
  useEffect(() => {
    if (!isAuthenticated) return;

    messagingService.subscribeToMessageUpdate(messagesProcessor);
    return () => {
      messagingService.unsubscribeFromMessageUpdate(messagesProcessor);
    };
  }, [messagingService, isAuthenticated]);

  // Providers values
  const messageStateValue = {
    messages,
    messagesRef,
    setMessages,
  };
  const channelStateValue = {
    channelList,
    activeChannel,
    activeChannelRef,
    channelListRef,
    unreadChannels,
    activeChannelMemberships,
    hasMembership,
    channelMessageToken,
    channelMessageTokenRef,
    meetingInfo,
    setActiveChannel,
    setActiveChannelMemberships,
    setChannelMessageToken,
    setChannelList,
    setUnreadChannels,
    setMeetingInfo,
  };
  return (
    <ChatMessagingServiceContext.Provider value={messagingService}>
      <ChatChannelState.Provider value={channelStateValue}>
        <ChatMessagingState.Provider value={messageStateValue}>
          {children}
        </ChatMessagingState.Provider>
      </ChatChannelState.Provider>
    </ChatMessagingServiceContext.Provider>
  );
};

const useChatMessagingService = () => {
  const context = useContext(ChatMessagingServiceContext);

  if (!context) {
    throw new Error(
<<<<<<< HEAD
      "useChatMessagingService must be used within ChatMessagingServiceContext"
=======
      'useChatMessagingService must be used within ChatMessagingServiceContext'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );
  }

  return context;
};

const useChatMessagingState = () => {
  const context = useContext(ChatMessagingState);

  if (!context) {
    throw new Error(
<<<<<<< HEAD
      "useChatMessagingState must be used within ChatMessagingState"
=======
      'useChatMessagingState must be used within ChatMessagingState'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );
  }

  return context;
};

const useChatChannelState = () => {
  const context = useContext(ChatChannelState);

  if (!context) {
<<<<<<< HEAD
    throw new Error("useChatChannelState must be used within ChatChannelState");
=======
    throw new Error('useChatChannelState must be used within ChatChannelState');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  }

  return context;
};

export {
  MessagingProvider,
  useChatChannelState,
  useChatMessagingService,
  useChatMessagingState,
};
