// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import { Grid, Cell } from "amazon-chime-sdk-component-library-react";
import Messages from "./messages/Messages";
import Input from "./input/Input";
import {
  useChatChannelState,
  useChatMessagingState,
} from "../providers/ChatMessagesProvider";
import { useAuthContext } from "../providers/AuthProvider";
=======
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
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MeetingChat = () => {
  const { member } = useAuthContext();

<<<<<<< HEAD
  const { messages, messagesRef, setMessages } = useChatMessagingState();
=======
  const {
    messages,
    messagesRef,
    setMessages,
  } = useChatMessagingState();
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const {
    setChannelMessageToken,
    activeChannel,
    activeChannelRef,
    hasMembership,
  } = useChatChannelState();

  return (
<<<<<<< HEAD
    <Grid style={{ overflowX: "auto", overflowY: "auto" }}>
=======
    <Grid style={{ overflowX: 'auto',overflowY: 'auto' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
