/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

import { useNotificationDispatch } from 'amazon-chime-sdk-component-library-react';
import appConfig from '../Config';
import { useAuthContext } from './AuthProvider';
import { listChannelMessages } from '../api/ChimeAPI';
import MessagingService from '../services/MessagingService';

const ChatMessagingState = createContext();
const ChatChannelState = createContext();
const ChatSentimentState = createContext();

const MessagingProvider = ({ children }) => {
  const { member, isAuthenticated, leaveChat } = useAuthContext();
  const [messagingService] = useState(() => new MessagingService(member));
  // Channel related
  const [activeChannel, setActiveChannel] = useState({
    ChannelArn: appConfig.channelArn,
  });
  const [activeChannelMemberships, setActiveChannelMemberships] = useState([]);
  const activeChannelRef = useRef(activeChannel.ChannelArn);
  const hasMembership = true;
  // Messages
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  const activeChannelMembershipsRef = useRef(activeChannelMemberships);
  const [channelMessageToken, setChannelMessageToken] = useState('');
  const [reactToSentiment, setReactToSentiment] = useState('NEUTRAL');
  const [positiveCnt, setPositiveCnt] = useState(0);
  const positiveCntRef = useRef(positiveCnt);
  const [negativeCnt, setNegativeCnt] = useState(0);
  const negativeCntRef = useRef(negativeCnt);
  const channelMessageTokenRef = useRef(channelMessageToken);
  const notificationDispatch = useNotificationDispatch();

  useEffect(() => {
    messagesRef.current = messages;
    activeChannelRef.current = activeChannel;
    activeChannelMembershipsRef.current = activeChannelMemberships;
    channelMessageTokenRef.current = channelMessageToken;
    positiveCntRef.current = positiveCnt;
    negativeCntRef.current = negativeCnt;
  });

  // Messaging service initiator
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchMessages = async () => {
      const newMessages = await listChannelMessages(
        activeChannel.ChannelArn,
        member.userId
      );
      setMessages(newMessages.Messages);
      setChannelMessageToken(newMessages.NextToken);
      setPositiveCnt(newMessages.positiveCnt);
      setNegativeCnt(newMessages.negativeCnt);
    };

    // Start messaging service
    console.log('Calling messaging disperse');
    messagingService.connect();
    console.log('Loading messages');
    fetchMessages();

    return () => {
      messagingService.close();
    };
  }, [isAuthenticated]);

  const processChannelMessage = async (message) => {
    const promise = Promise.resolve(message);
    const newMessage = await promise.then((m) => m);

    if (newMessage.Type === 'CONTROL') {
      try {
        const content = JSON.parse(newMessage.Content);
        if (content?.sentiment) {
          content.sentiment === 'POSITIVE'
            ? setPositiveCnt(positiveCntRef.current + 1)
            : setNegativeCnt(negativeCntRef.current + 1);
          setReactToSentiment(content.sentiment);
          console.log(`React to ${content.sentiment}`);
          setTimeout(() => {
            setReactToSentiment('NEUTRAL');
          }, 5000);
        }
      } catch (err) {
        //Ignore if not JSON
      }
      return;
    }

    let isDuplicate = false;

    messagesRef.current.forEach((m, i, self) => {
      if ((m.response?.MessageId || m.MessageId) === newMessage.MessageId) {
        console.log('Duplicate message found', newMessage);
        isDuplicate = true;
        self[i] = newMessage;
      }
    });

    let newMessages = [...messagesRef.current];

    if (!isDuplicate) {
      newMessages = [...newMessages, newMessage];
    }

    setMessages(newMessages);
  };

  const messagesProcessor = async (message) => {
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
        if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
          processChannelMessage(record);
        }
        break;
      case 'DELETE_CHANNEL_MEMBERSHIP':
        // You are removed
        if (record.Member.Arn.includes(member.userId)) {
          if (activeChannelRef.current.ChannelArn === record.ChannelArn) {
            setActiveChannel({});
          }
          leaveChat();
          notificationDispatch({
            type: 0,
            payload: {
              message: 'You have been kicked from the chat room',
              severity: 'error',
            },
          });
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
    messagingService.subscribeToMessageUpdate(messagesProcessor);
    return () => {
      messagingService.unsubscribeFromMessageUpdate(messagesProcessor);
    };
  }, [messagingService]);

  // Providers values
  const messageStateValue = {
    messages,
    messagesRef,
    setMessages,
  };
  const channelStateValue = {
    activeChannel,
    activeChannelRef,
    activeChannelMemberships,
    hasMembership,
    channelMessageToken,
    channelMessageTokenRef,
    setActiveChannel,
    setActiveChannelMemberships,
    setChannelMessageToken,
  };
  const chatSentimentValue = {
    reactToSentiment,
    positiveCnt,
    setPositiveCnt,
    negativeCnt,
    setNegativeCnt,
  };

  return (
    <ChatChannelState.Provider value={channelStateValue}>
      <ChatMessagingState.Provider value={messageStateValue}>
        <ChatSentimentState.Provider value={chatSentimentValue}>
          {children}
        </ChatSentimentState.Provider>
      </ChatMessagingState.Provider>
    </ChatChannelState.Provider>
  );
};

const useChatMessagingState = () => {
  const context = useContext(ChatMessagingState);

  if (!context) {
    throw new Error(
      'useChatMessagingState must be used within ChatMessagingState'
    );
  }

  return context;
};

const useChatChannelState = () => {
  const context = useContext(ChatChannelState);

  if (!context) {
    throw new Error('useChatChannelState must be used within ChatChannelState');
  }

  return context;
};

const useChatSentimentState = () => {
  const context = useContext(ChatSentimentState);

  if (!context) {
    throw new Error(
      'useChatSentimentState must be used within ChatSentimentState'
    );
  }

  return context;
};

export {
  MessagingProvider,
  useChatChannelState,
  useChatMessagingState,
  useChatSentimentState,
};
