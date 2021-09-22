// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Grid,
  Cell,
} from 'amazon-chime-sdk-component-library-react';
import Messages from './messages/Messages';
import Input from './input/Input';
import {
  useChatChannelState,
  useChatMessagingState,
} from '../providers/ChatMessagesProvider';
import { useAuthContext } from '../providers/AuthProvider';

const MeetingChat = () => {
  const { member } = useAuthContext();

  const {
    messages,
    messagesRef,
    setMessages,
  } = useChatMessagingState();

  const {
    setChannelMessageToken,
    activeChannel,
    activeChannelRef,
    hasMembership,
  } = useChatChannelState();

  return (
    <Grid style={{ overflowX: 'auto',overflowY: 'auto' }}>
      <Cell>
        <div className="messaging-container">
          <Messages
            messages={messages}
            messagesRef={messagesRef}
            setMessages={setMessages}
            channelArn={activeChannelRef.current.ChannelArn}
            setChannelMessageToken={setChannelMessageToken}
            activeChannelRef={activeChannelRef}
            channelName={activeChannel.Name}
            userId={member.userId}
          />
          <Input
            activeChannelArn={activeChannel.ChannelArn}
            member={member}
            hasMembership={hasMembership}
          />
        </div>
      </Cell>
    </Grid>
  );
};

export default MeetingChat;
