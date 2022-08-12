/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Badge } from 'amazon-chime-sdk-component-library-react';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

import appConfig from '../../Config';
import { useAuthContext } from '../AuthProvider';
import {
  MessageType,
  Persistence,
  createMemberArn,
  describeChannel,
  sendChannelMessage,
  updateChannel,
  listChannelMessages,
} from '../../api/ChimeAPI';
import MessagingService from '../../services/MessagingService';
import mergeArrayOfObjects from '../../utilities/mergeArrays';
import {
  PresenceMode,
  PresenceAutoStatus,
  PresenceStatusPrefix,
  PRESENCE_REGEX,
  PRESENCE_PREFIX,
  PRESENCE_PREFIX_SEPARATOR,
  REFRESH_INTERVAL,
  isAutomaticStatusExpired,
  toPresenceMessage,
  toPresenceMap,
} from '../../utilities/presence';

const ChatMessagingServiceContext = createContext(MessagingService);
const ChatMessagingState = createContext();
const ChatChannelState = createContext();

const MessagingProvider = ({ children }) => {
  const { member, isAuthenticated } = useAuthContext();
  const [messagingService] = useState(() => new MessagingService());
  // Channel related
  const [activeChannel, setActiveChannel] = useState({});
  const [activeView, setActiveView] = useState('User');
  const [activeSubChannel, setActiveSubChannel] = useState({});
  const [activeChannelFlow, setActiveChannelFlow]= useState({});
  const [activeChannelMemberships, setActiveChannelMemberships] = useState([]);
  const [activeChannelMembershipsWithPresence, setActiveChannelMembershipsWithPresence] = useState([]);
  const activeSubChannelRef = useRef(activeSubChannel.ChannelArn);
  const activeChannelRef = useRef(activeChannel.ChannelArn);
  const [channelList, setChannelList] = useState([]);
  const [typingIndicator, setTypingIndicator] = useState(null);
  const [channelListModerator, setChannelListModerator] = useState([]);
  const [subChannelList, setSubChannelList] = useState([]);
  const [subChannelIds, setSubChannelIds] = useState([]);
  const [unreadChannels, setUnreadChannels] = useState([]);
  const unreadChannelsListRef = useRef(unreadChannels);
  const hasMembership =
    activeChannelMemberships
      .map((m) => m.Member.Arn)
      .indexOf(createMemberArn(member.userId)) > -1;
  // Messages
  const [messages, setMessages] = useState([]);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const messagesRef = useRef(messages);
  const channelListRef = useRef(channelList);
  const [moderatedChannel, setModeratedChannel] = useState('');
  const channelListModeratorRef = useRef(channelListModerator);
  const subChannelListRef = useRef(subChannelList);
  const activeChannelMembershipsRef = useRef(activeChannelMemberships);
  const activeChannelMembershipsWithPresenceRef = useRef(activeChannelMembershipsWithPresence);
  const [channelMessageToken, setChannelMessageToken] = useState('');
  const channelMessageTokenRef = useRef(channelMessageToken);
  // Meeting
  const [meetingInfo, setMeetingInfo] = useState('');

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    messagesRef.current = messages;
    activeChannelRef.current = activeChannel;
    activeSubChannelRef.current = activeSubChannel;
    channelListRef.current = channelList;
    channelListModeratorRef.current = channelListModerator;
    subChannelListRef.current = subChannelList;
    unreadChannelsListRef.current = unreadChannels;
    activeChannelMembershipsRef.current = activeChannelMemberships;
    activeChannelMembershipsWithPresenceRef.current = activeChannelMembershipsWithPresence;
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

  useEffect(() => {
    if (activeChannelMemberships.length > 0) {
      renderDefaultChannelPresence();
    }
  }, [activeChannel.ChannelArn]);

  useEffect(() => {
    if (activeChannelMemberships.length > 0) {
      refreshChannelPresence();
    }
  }, [activeChannelMemberships]);

  function buildPresenceFromChannelMetadata() {
    const presenceMap = toPresenceMap(activeChannel.Metadata);
    return activeChannelMembershipsRef.current
        .filter((m) => m.Member.Arn !== createMemberArn(member.userId))
        .map((m) => {
              const userId = m.Member.Arn.split('user/')[1];
              const status = presenceMap && presenceMap[userId] || `${PresenceStatusPrefix.Auto}${PresenceAutoStatus.Offline}`;
              const isAutomatic = status.startsWith(PresenceStatusPrefix.Auto);
              const persistedStatus = status.substr(status.indexOf(PRESENCE_PREFIX_SEPARATOR) + 1);
              m.Member.Presence = {
                ...(m.Member.Presence || {}),
                IsAutomatic: isAutomatic,
                Status: isAutomatic && !isAutomaticStatusExpired(m.Member.Presence?.LastUpdatedTimestamp) ? (m.Member.Presence?.Status || PresenceAutoStatus.Offline) : persistedStatus,
              };
              return m;
            }
        );
  }

  function renderDefaultChannelPresence () {
    const updatedMemberships = buildPresenceFromChannelMetadata();
    setActiveChannelMembershipsWithPresence(updatedMemberships);
  }

  function refreshChannelPresence() {
    let refreshTimeout;
    (function refresh() {
      if (!isAuthenticatedRef.current) {
        clearTimeout(refreshTimeout);
        return;
      }
      if (activeChannelMembershipsWithPresenceRef.current.length === 0) {
        renderDefaultChannelPresence();
      } else {
        const updatedMemberships = buildPresenceFromChannelMetadata();
        const entries = Object.fromEntries(activeChannelMembershipsWithPresenceRef.current.map((entry) => [entry.Member.Arn, entry])) || [];
        updatedMemberships.filter(m => !m.Member.Presence?.Status || m.Member.Presence?.IsAutomatic).forEach((m) => {
              const presence = entries[m.Member.Arn]?.Member.Presence || {};
              m.Member.Presence = {
                ...presence,
                Status: !isAutomaticStatusExpired(presence.LastUpdatedTimestamp) ? presence.Status : PresenceAutoStatus.Offline,
              };
            }
        );
        setActiveChannelMembershipsWithPresence(updatedMemberships);
      }

      refreshTimeout = setTimeout(refresh, REFRESH_INTERVAL);
    })();
  }

  const processChannelMessage = async (message) => {
    const promise = Promise.resolve(message);
    const newMessage = await promise.then((m) => m);

    let isDuplicate = false;

    messagesRef.current.forEach((m, i, self) => {
      if ((m.response?.MessageId || m.MessageId) === newMessage.MessageId) {
        console.log('Duplicate message found', newMessage);
        isDuplicate = true;
        self[i] = newMessage;
      }
    });

    let newMessages = [...messagesRef.current];

    if (!isDuplicate && newMessage.Persistence === Persistence.PERSISTENT) {
      newMessages = [...newMessages, newMessage];
    }

    setMessages(newMessages);
  };

  const addUpdateDisabledMessage = async (recordChannelArn) => {
    let newMessages = [...messagesRef.current];
    const newMessage = {
      OldMessageUpdateDisabled: true,
    };
    newMessages = [...newMessages, newMessage];
    setMessages(newMessages);
  }

  async function initChannelPresence(newChannel) {
    if(!activeChannel.ElasticChannelConfiguration && !activeChannel.SubChannelId){
      const status = `${PresenceStatusPrefix.Auto}${PresenceAutoStatus.Online}`;
    let channelMetadata = JSON.parse(newChannel.Metadata || '{}');
    if (!channelMetadata.Presence) {
      console.log('channel does not use persistent presence. skip.')
      return;
    }

    const entries = Object.fromEntries(channelMetadata.Presence.map((entry) => [entry.u, entry.s]))
    if (entries && entries[member.userId]) {
      channelMetadata.Presence.forEach(p => {
        if (p.u === member.userId) {
          p.s = status;
        }
      });
    } else {
      const entry = {u: member.userId, s: status};
      channelMetadata = {
        ...(newChannel.Metadata && JSON.parse(newChannel.Metadata)),
        Presence: [
          ...(newChannel.Metadata && JSON.parse(newChannel.Metadata)?.Presence || []),
          entry
        ]
      };
    }
    newChannel.Metadata = JSON.stringify(channelMetadata);
    channelList.filter(c => c.ChannelArn === newChannel.ChannelArn)[0].Metadata = newChannel.Metadata;
    setChannelList(channelList);

    await updateChannel(
        newChannel.ChannelArn,
        newChannel.Name,
        newChannel.Mode,
        channelMetadata,
        member.userId
    );

    await sendChannelMessage(
        activeChannel.ChannelArn,
        toPresenceMessage(PresenceMode.Auto, PresenceAutoStatus.Online, true),
        Persistence.NON_PERSISTENT,
        MessageType.CONTROL,
        member,
        activeChannel.SubChannelId,
    );
    }
  }

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
      case 'DENIED_CREATE_CHANNEL_MESSAGE':
      case 'FAILED_CREATE_CHANNEL_MESSAGE':
      case 'DENIED_UPDATE_CHANNEL_MESSAGE':
      case 'FAILED_UPDATE_CHANNEL_MESSAGE':
      case 'PENDING_CREATE_CHANNEL_MESSAGE':
      case 'PENDING_UPDATE_CHANNEL_MESSAGE':
        // Process ChannelMessage
        if (record.Metadata) {
          const metadata = JSON.parse(record.Metadata);
          if (metadata.isMeetingInfo && record.Sender.Arn !== createMemberArn(member.userId)) {
            const meetingInfo = JSON.parse(record.Content);
            setMeetingInfo(meetingInfo);
            break;
          }
        }
        // Process typing indicator control message
        if (record.Content && record.Content.match(/Typing/)) {
          if (record.Sender.Arn !== createMemberArn(member.userId)) {
            if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
              const indicator = {
                SenderName: record.Sender.Name,
                LastUpdatedTimestamp: record.LastUpdatedTimestamp
              }
              setTypingIndicator(indicator);
            }
            break;
          }
        }

        // Process channel presence status control message
        if (!!(record.Content?.match(PRESENCE_REGEX))) {
          if (record.Sender.Arn !== createMemberArn(member.userId)) {
            console.log('presence info accepted. content: ' + JSON.stringify(record));
            if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
              const updatedMemberships = activeChannelMembershipsWithPresenceRef.current.map(
                  (m) => {
                    if (m.Member.Arn === record.Sender.Arn) {
                      const content = record.Content;
                      const isAutomatic = content.startsWith(`${PRESENCE_PREFIX}${PresenceStatusPrefix.Auto}`);
                      const status = content.substr(content.lastIndexOf(PRESENCE_PREFIX_SEPARATOR) + 1);
                      const statusExpired = isAutomaticStatusExpired(record.LastUpdatedTimestamp);
                      m.Member.Presence = {
                        IsAutomatic: isAutomatic,
                        Status:  isAutomatic ? ( !statusExpired ? status : PresenceAutoStatus.Offline) : status || PresenceAutoStatus.Offline,
                        LastUpdatedTimestamp: record.LastUpdatedTimestamp
                      };
                    }
                    return m;
                  }
              );
              setActiveChannelMembershipsWithPresence(updatedMemberships);
            }
          }
          break;
        }

        // Process channel message
        if (activeChannelRef.current.ChannelArn === record?.ChannelArn
          && activeChannelRef.current.SubChannelId === record.SubChannelId) {
          processChannelMessage(record);
        } else {
          const findMatch = unreadChannelsListRef.current.find(
            (chArn) => (chArn === record.ChannelArn && activeChannelRef.current.SubChannelId === record.SubChannelId)
          );
          if (findMatch) return;
          if (!record.SubChannelId) {
            const newUnreads = [
              ...unreadChannelsListRef.current,
              record.ChannelArn,
            ];
            setUnreadChannels(newUnreads);
          }
        }
        break;
      // Channels actions
      case 'CREATE_CHANNEL':
      case 'UPDATE_CHANNEL':
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
      case 'DELETE_CHANNEL': {
        setChannelList(
          channelListRef.current.filter(
            (chRef) => chRef.ChannelArn !== record.ChannelArn
          )
        );
        if (activeChannelRef.current.ChannelArn === record.ChannelArn) {
          setActiveChannel({});
        }
        break;
      }
      // Channel Memberships
      case 'CREATE_CHANNEL_MEMBERSHIP':
        {
          var newChannel = await describeChannel(
            record.ChannelArn,
            member.userId
          );

          if (record.SubChannelId) {
            newChannel.SubChannelId = record.SubChannelId;
            subChannelIds.push(record.SubChannelId);
          }

          if (newChannel.Metadata) {
            let metadata = JSON.parse(newChannel.Metadata);
            if (metadata.isHidden) return;
          }
          var newChannelList = [];
          const channelType = JSON.parse(activeChannelRef.current.Metadata || '{}').ChannelType;
          if (activeChannelRef.current.ElasticChannelConfiguration || channelType != 'PUBLIC_ELASTIC') {
            newChannelList = mergeArrayOfObjects(
              [newChannel],
              channelListRef.current,
              'ChannelArn'
            );
          } else {
            newChannelList = mergeArrayOfObjects(
              channelListRef.current,
              [newChannel],
              'ChannelArn'
            );
            if (record.ChannelArn == activeChannelRef.current.ChannelArn
              && channelType == 'PUBLIC_ELASTIC') {
              const newMessages = await listChannelMessages(
                newChannel.ChannelArn,
                member.userId,
                newChannel.SubChannelId
              );
              setMessages(newMessages.Messages);
              setChannelMessageToken(newMessages.NextToken);
              setActiveChannel(newChannel);
            }
          }
          setChannelList(newChannelList);

          // If channel uses persistent presence, save status for the user
          await initChannelPresence(newChannel);
        }
        break;
      case 'UPDATE_CHANNEL_MEMBERSHIP':
        if (
          `${appConfig.appInstanceArn}/user/${member.userId}` !==
          record?.InvitedBy.Arn
        ) {
          const channel = await describeChannel(
            record?.ChannelArn,
            member.userId
          );
          var newChannelList;
          if (record.SubChannelId) {
            channel.SubChannelId = record.SubChannelId;
            if (activeChannelRef.current.ChannelArn === record?.ChannelArn) {
              addUpdateDisabledMessage(record.ChannelArn);
              setActiveChannel(channel);
            }
          }
          newChannelList = mergeArrayOfObjects(
            channelListRef.current,
            [channel],
            'ChannelArn'
          );
          setChannelList(newChannelList);
        }
        break;
      case 'DELETE_CHANNEL_MEMBERSHIP':
        // You are removed
        if (record.Member.Arn.includes(member.userId)) {
          setChannelList(
            channelListRef.current.filter(
              (chRef) => chRef.ChannelArn !== record.ChannelArn
            )
          );
          if (record.SubChannelId) {
            const foundIndex = subChannelIds.findIndex(
              ori => ori === record.SubChannelId
            );
            subChannelIds.splice(foundIndex, 1);
            setSubChannelIds(subChannelIds);
            const newSubChannelList = subChannelListRef.current.filter(
              ori => ori.SubChannelId !== record.SubChannelId
            );
            setSubChannelList(newSubChannelList);
          }
          if (activeChannelRef.current.ChannelArn === record.ChannelArn
            && activeChannelRef.current.SubChannelId === record.SubChannelId) {
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
    channelListModerator,
    subChannelList,
    subChannelIds,
    activeChannel,
    activeView,
    activeSubChannel,
    activeChannelFlow,
    activeChannelRef,
    activeSubChannelRef,
    channelListRef,
    channelListModeratorRef,
    subChannelListRef,
    unreadChannels,
    activeChannelMemberships,
    activeChannelMembershipsWithPresence,
    hasMembership,
    channelMessageToken,
    channelMessageTokenRef,
    meetingInfo,
    setActiveChannel,
    setActiveView,
    setActiveSubChannel,
    setActiveChannelFlow,
    setActiveChannelMemberships,
    setActiveChannelMembershipsWithPresence,
    setChannelMessageToken,
    setChannelList,
    setChannelListModerator,
    setSubChannelList,
    setSubChannelIds,
    setUnreadChannels,
    setMeetingInfo,
    moderatedChannel,
    setModeratedChannel,
    typingIndicator,
    setTypingIndicator,
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
      'useChatMessagingService must be used within ChatMessagingServiceContext'
    );
  }

  return context;
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

export {
  MessagingProvider,
  useChatChannelState,
  useChatMessagingService,
  useChatMessagingState,
  
};
