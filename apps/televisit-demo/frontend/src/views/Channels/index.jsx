/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  Heading,
  Grid,
  Cell,
  useNotificationDispatch,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";
import { useTheme } from "styled-components";
import ChannelsWrapper from "../../containers/channels/ChannelsWrapper";
import Messages from "../../containers/messages/Messages";
import Input from "../../containers/input/Input";
import "./style.css";
import {
  useChatChannelState,
  useChatMessagingState,
} from "../../providers/ChatMessagesProvider";
import { useAuthContext } from "../../providers/AuthProvider";
=======
} from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';
import ChannelsWrapper from '../../containers/channels/ChannelsWrapper';
import Messages from '../../containers/messages/Messages';
import Input from '../../containers/input/Input';
import './style.css';
import {
  useChatChannelState,
  useChatMessagingState,
} from '../../providers/ChatMessagesProvider';
import { useAuthContext } from '../../providers/AuthProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const Channels = () => {
  const currentTheme = useTheme();

  const { member, userSignOut } = useAuthContext();
<<<<<<< HEAD
  const { messages, messagesRef, setMessages, onReceiveMessage } =
    useChatMessagingState();
=======
  const {
    messages,
    messagesRef,
    setMessages,
    onReceiveMessage,
  } = useChatMessagingState();
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const notificationDispatch = useNotificationDispatch();

  const {
    setChannelMessageToken,
    setChannelList,
    activeChannel,
    activeChannelRef,
    channelList,
    hasMembership,
  } = useChatChannelState();

  const handleUserNameCopyClick = (_e) => {
    // Create new element
<<<<<<< HEAD
    const el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = member.userId;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
=======
    const el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = member.userId;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
<<<<<<< HEAD
    document.execCommand("copy");
=======
    document.execCommand('copy');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    // Remove temporary element
    document.body.removeChild(el);

    notificationDispatch({
      type: 0,
      payload: {
<<<<<<< HEAD
        message: "UserId copied to clipboard!",
        severity: "info",
=======
        message: 'UserId copied to clipboard!',
        severity: 'info',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        autoClose: true,
        autoCloseDelay: 1000,
      },
    });
  };

  return (
    <Grid
      gridTemplateColumns="1fr 10fr"
      gridTemplateRows="3rem 101%"
<<<<<<< HEAD
      style={{ width: "100vw", height: "100vh" }}
=======
      style={{ width: '100vw', height: '100vh' }}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      gridTemplateAreas='
      "heading heading"
      "side main"      
      '
    >
      <Cell gridArea="heading">
        {/* HEADING */}
        <Heading
          level={5}
          style={{
            backgroundColor: currentTheme.colors.greys.grey60,
<<<<<<< HEAD
            height: "3rem",
            paddingLeft: "1rem",
            color: "white",
=======
            height: '3rem',
            paddingLeft: '1rem',
            color: 'white',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          }}
          className="app-heading"
        >
          AWS TeleHealth Demo
          <div className="user-block">
            <a className="user-info" href="#">
<<<<<<< HEAD
              {member.username || "Unknown"}
=======
              {member.username || 'Unknown'}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              <span onClick={handleUserNameCopyClick} className="tooltiptext">
                Click to copy UserId to clipboard!
              </span>
            </a>

            <a href="#" onClick={userSignOut}>
              Log out
            </a>
          </div>
        </Heading>
      </Cell>
<<<<<<< HEAD
      <Cell gridArea="side" style={{ height: "calc(100vh - 3rem)" }}>
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: "100%",
=======
      <Cell gridArea="side" style={{ height: 'calc(100vh - 3rem)' }}>
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: '100%',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
            borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`,
          }}
        >
          {/* SIDEPANEL CHANNELS LIST */}
          <ChannelsWrapper />
        </div>
      </Cell>
<<<<<<< HEAD
      <Cell gridArea="main" style={{ height: "calc(100vh - 3rem)" }}>
=======
      <Cell gridArea="main" style={{ height: 'calc(100vh - 3rem)' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        {/* MAIN CHAT CONTENT WINDOW */}
        {activeChannel.ChannelArn ? (
          <>
            <div className="messaging-container">
              <Messages
                messages={messages}
                messagesRef={messagesRef}
                setMessages={setMessages}
                currentMember={member}
                onReceiveMessage={onReceiveMessage}
                setChannelList={setChannelList}
                channelList={channelList}
                channelArn={activeChannelRef.current.ChannelArn}
                setChannelMessageToken={setChannelMessageToken}
                activeChannelRef={activeChannelRef}
                channelName={activeChannel.Name}
                userId={member.userId}
              />
              <Input
                style={{
                  borderTop: `solid 1px ${currentTheme.colors.greys.grey40}`,
                }}
                activeChannelArn={activeChannel.ChannelArn}
                member={member}
                hasMembership={hasMembership}
              />
            </div>
          </>
        ) : (
          <div className="placeholder">Welcome to AWS TeleHealth Demo</div>
        )}
      </Cell>
    </Grid>
  );
};

export default Channels;
