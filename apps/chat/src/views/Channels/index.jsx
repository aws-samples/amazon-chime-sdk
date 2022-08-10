/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { Cell, Grid, Heading, useNotificationDispatch, } from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';

import ChannelsWrapper from '../../containers/channels/ChannelsWrapper';
import ChannelPresence from '../../containers/Presence/ChannelPresence';
import Messages from '../../containers/messages/Messages';
import Input from '../../containers/input/Input';
import TypingIndicator from '../../containers/TypingIndicator';
import { useChatChannelState, useChatMessagingState, } from '../../providers/ChatMessagesProvider';
import { useAuthContext } from '../../providers/AuthProvider';
import { PresenceAutoStatus, PresenceMode, toPresenceMap, toPresenceMessage, } from '../../utilities/presence';
import { MessageType, Persistence, sendChannelMessage, } from '../../api/ChimeAPI';

import './style.css';

const Channels = () => {
  const currentTheme = useTheme();
  const { activeChannelMemberships } = useChatChannelState();
  const { member, userSignOut } = useAuthContext();
  const {
    messages,
    messagesRef,
    setMessages,
    onReceiveMessage,
  } = useChatMessagingState();
  const notificationDispatch = useNotificationDispatch();

  const {
    setChannelMessageToken,
    setSubChannelList,
    setChannelList,
    setChannelListModerator,
    setActiveView,
    activeView,
    activeChannel,
    activeChannelRef,
    channelList,
    channelListModerator,
    subChannelList,
    hasMembership,
    moderatedChannel,
  } = useChatChannelState();

  const handleUserNameCopyClick = (_e) => {
    // Create new element
    const el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = member.userId;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);

    notificationDispatch({
      type: 0,
      payload: {
        message: 'UserId copied to clipboard!',
        severity: 'info',
        autoClose: true,
        autoCloseDelay: 1000,
      },
    });
  };

  async function publishOfflineStatus() {
    if (activeChannel && activeChannel.ChannelArn) {
      const presenceMap = toPresenceMap(activeChannel.Metadata);
      const customPresenceExists = presenceMap && presenceMap[member.userId];
      if (!customPresenceExists) {
        await sendChannelMessage(
          activeChannel.ChannelArn,
          toPresenceMessage(PresenceMode.Auto, PresenceAutoStatus.Offline, true),
          Persistence.NON_PERSISTENT,
          MessageType.CONTROL,
          member,
          activeChannel.SubChannelId
        );
      }
    }
  }

  function handleLogout() {
    return async () => {
      if (
        !activeChannel.ElasticChannelConfiguration &&
        !activeChannel.SubChannelId
      ) {
        await publishOfflineStatus();
      }
      userSignOut();
    };
  }

  const showChannelMembers = () => !(activeChannel && JSON.parse(activeChannel.Metadata || "{}").isMeeting) && activeChannelMemberships.length > 1;

  return (
    <Grid
      gridTemplateColumns="1fr 10fr"
      gridTemplateRows="3rem 101%"
      style={{ width: '100vw', height: '100vh' }}
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
            height: '3rem',
            paddingLeft: '1rem',
            color: 'white',
          }}
          className="app-heading"
        >
          {activeView === 'Moderator' && moderatedChannel.Name} Chat App
          <div className="user-block">
            <a className="user-info" href="#">
              {member.username || 'Unknown'}
              <span onClick={handleUserNameCopyClick} className="tooltiptext">
                Click to copy UserId to clipboard!
              </span>
            </a>

            <a href="#" onClick={handleLogout()}>
              Log out
            </a>
          </div>
        </Heading>
      </Cell>
      <Cell gridArea="side" style={{ height: 'calc(100vh - 3rem)' }}>
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: '100%',
            borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`,
          }}
        >
          {/* SIDEPANEL CHANNELS LIST */}
          <ChannelsWrapper />
        </div>
      </Cell>
      <Cell gridArea="main" style={{ height: 'calc(100vh - 3rem)' }}>
        {/* MAIN CHAT CONTENT WINDOW */}
        {activeChannel.ChannelArn &&
          (!activeChannel.ElasticChannelConfiguration ||
            activeChannel.SubChannelId) ? (
          <>
            <div
              className={
                "channel-content-container " +
                ((showChannelMembers() && !activeChannel.SubChannelId
                  && JSON.parse(activeChannel.Metadata || '{}').ChannelType != 'PUBLIC_ELASTIC') ? "channel-content-container-grid" : '')
              }
            >
              <div className="messaging-container">
                <Messages
                  messages={messages}
                  messagesRef={messagesRef}
                  setMessages={setMessages}
                  currentMember={member}
                  onReceiveMessage={onReceiveMessage}
                  setChannelList={setChannelList}
                  channelList={channelList}
                  setChannelListModerator={setChannelListModerator}
                  channelListModerator={channelListModerator}
                  subChannelList={subChannelList}
                  setSubChannelList={setSubChannelList}
                  channelArn={activeChannelRef.current.ChannelArn}
                  setChannelMessageToken={setChannelMessageToken}
                  activeChannelRef={activeChannelRef}
                  channelName={activeChannel.Name}
                  userId={member.userId}
                />
                <TypingIndicator />
                <Input
                  style={{
                    borderTop: `solid 1px ${currentTheme.colors.greys.grey40}`,
                  }}
                  activeChannelArn={activeChannel.ChannelArn}
                  member={member}
                  hasMembership={hasMembership}
                  activeChannel={activeChannel}
                />
              </div>
              {showChannelMembers() && !activeChannel.SubChannelId
                && JSON.parse(activeChannel.Metadata || "{}").ChannelType != 'PUBLIC_ELASTIC' && (
                  <div className="channel-members-container">
                    <ChannelPresence />
                  </div>
                )}
            </div>
          </>
        ) : (
          <div className="placeholder">Welcome</div>
        )}
      </Cell>
    </Grid>
  );
};

export default Channels;
