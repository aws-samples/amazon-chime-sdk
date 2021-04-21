/* eslint-disable react/no-children-prop */
/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import {
  InfiniteList,
  ChatBubble,
  ChatBubbleContainer,
  formatTime,
} from 'amazon-chime-sdk-component-library-react';

import { listChannelMessages, createMemberArn } from '../../api/ChimeAPI';
import insertDateHeaders from '../../utilities/insertDateHeaders';

import './style.css';
import { useChatChannelState } from '../../providers/ChatMessagesProvider';

const Messages = ({
  messages,
  messagesRef,
  setMessages,
  userId,
  setChannelMessageToken,
  activeChannelRef,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { channelMessageTokenRef } = useChatChannelState();

  const handleScrollTop = async () => {
    setIsLoading(true);
    if (!channelMessageTokenRef.current) {
      console.log('No new messages');
      setIsLoading(false);
      return;
    }
    const oldMessages = await listChannelMessages(
      activeChannelRef.current.ChannelArn,
      userId,
      channelMessageTokenRef.current
    );
    const newMessages = [...oldMessages.Messages, ...messagesRef.current];

    setMessages(newMessages);
    setChannelMessageToken(oldMessages.NextToken);
    setIsLoading(false);
  };

  const flattenedMessages = messages.map((m) => {
    const content = !m.Content || m.Redacted ? '(Deleted)' : m.Content;
    return {
      content: content,
      messageId: m.MessageId,
      createdTimestamp: m.CreatedTimestamp,
      redacted: m.Redacted,
      senderName: m.Sender.Name,
      senderId: m.Sender.Arn,
      metadata: m.Metadata,
    };
  });

  const listItems = insertDateHeaders(flattenedMessages);

  const messageList = listItems.map((m, i, self) => {
    if (!m.content) {
      return m;
    }

    const variant =
      createMemberArn(userId) === m.senderId ? 'outgoing' : 'incoming';
    const actions = null;

    const prevMessageSender = self[i - 1]?.senderId;
    const currMessageSender = m.senderId;
    const nextMessageSender = self[i + 1]?.senderId;

    let showTail = true;
    if (
      currMessageSender && // it is a message
      nextMessageSender && // the item after is a message
      currMessageSender === nextMessageSender // the item after is from the same sender
    ) {
      showTail = false;
    }
    let showName = true;
    if (
      currMessageSender && // it is a message
      prevMessageSender && // the item before is a message
      currMessageSender === prevMessageSender // the message before is from the same sender
    ) {
      showName = false;
    }

    return (
      <div className="message">
        <ChatBubbleContainer
          timestamp={formatTime(m.createdTimestamp)}
          actions={actions}
          key={`message${i.toString()}`}
          css="margin: 1rem;"
        >
          <ChatBubble
            variant={variant}
            senderName={showName ? m.senderName : undefined}
            redacted={m.redacted}
            showTail={showTail}
          >
            <div>{m.content}</div>
          </ChatBubble>
        </ChatBubbleContainer>
      </div>
    );
  });

  return (
    <div className="message-list-container">
      <InfiniteList
        style={{ display: 'flex', flexGrow: '1' }}
        items={messageList}
        onLoad={handleScrollTop}
        isLoading={isLoading}
        className="chat-message-list"
      />
    </div>
  );
};
export default Messages;
