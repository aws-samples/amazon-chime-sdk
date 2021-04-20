/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Heading, Grid, Cell } from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';
import Messages from '../../components/Messages';
import Input from '../../components/Input';
import './style.css';
import {
  useChatChannelState,
  useChatMessagingState,
} from '../../providers/ChatMessagesProvider';
import { useAuthContext } from '../../providers/AuthProvider';
import SentimentReaction from '../../components/SentimentReaction';
import SentimentAnalysis from '../../components/SentimentAnalysis';

const Channel = () => {
  const currentTheme = useTheme();

  const { member } = useAuthContext();
  const { messages, messagesRef, setMessages } = useChatMessagingState();

  const {
    setChannelMessageToken,
    activeChannel,
    activeChannelRef,
  } = useChatChannelState();

  return (
    <Grid
      gridTemplateRows="3rem 101%"
      style={{ width: '100vw', height: '100vh' }}
      gridTemplateAreas='
      "heading"
      "main"
      '
    >
      <Cell gridArea="heading">
        {/* HEADING */}
        <Heading
          level={5}
          style={{
            backgroundColor: currentTheme.colors.greys.grey60,
            height: '3rem',
            paddingLeft: '1rem',
            color: 'white',
          }}
          className="app-heading"
        >
          Chat App
          <div className="user-block">
            <SentimentAnalysis />
          </div>
        </Heading>
      </Cell>
      <Cell gridArea="main" style={{ height: 'calc(100vh - 3rem)' }}>
        {/* MAIN CHAT CONTENT WINDOW */}
        <div className="messaging-container">
          {messages && messages.length > 0 ? (
            <Messages
              messages={messages}
              messagesRef={messagesRef}
              setMessages={setMessages}
              setChannelMessageToken={setChannelMessageToken}
              activeChannelRef={activeChannelRef}
              userId={member.userId}
            />
          ) : (
            <></>
          )}
          <Input
            style={{
              borderTop: `solid 1px ${currentTheme.colors.greys.grey40}`,
            }}
            activeChannelArn={activeChannel.ChannelArn}
            member={member}
          />
          <SentimentReaction />
        </div>
      </Cell>
    </Grid>
  );
};

export default Channel;
