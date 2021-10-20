/* eslint-disable react/no-children-prop */
/* eslint-disable no-console */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
import React, { useState, useEffect } from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  InfiniteList,
  PopOverItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
  ChatBubble,
  ChatBubbleContainer,
  EditableChatBubble,
  formatDate,
  formatTime,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";
import { AttachmentProcessor } from "./AttachmentProcessor";
=======
} from 'amazon-chime-sdk-component-library-react';
import { AttachmentProcessor } from './AttachmentProcessor';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  listChannelMessages,
  createMemberArn,
  updateChannelMessage,
  redactChannelMessage,
<<<<<<< HEAD
} from "../../api/ChimeAPI";
import insertDateHeaders from "../../utilities/insertDateHeaders";

import "./Messages.css";
import {
  useChatChannelState,
  useChatMessagingState,
} from "../../providers/ChatMessagesProvider";
=======
} from '../../api/ChimeAPI';
import insertDateHeaders from '../../utilities/insertDateHeaders';

import './Messages.css';
import { useChatChannelState, useChatMessagingState } from '../../providers/ChatMessagesProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const Messages = ({
  messages,
  messagesRef,
  setMessages,
  channelArn,
  channelName,
  userId,
  setChannelMessageToken,
  activeChannelRef,
}) => {
  const { channelMessageTokenRef } = useChatChannelState();
  const [isLoading, setIsLoading] = useState(false);

  const handleScrollTop = async () => {
    setIsLoading(true);
    if (!channelMessageTokenRef.current) {
<<<<<<< HEAD
      console.log("No new messages");
=======
      console.log('No new messages');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRedactModal, setShowRedactModal] = useState(false);

<<<<<<< HEAD
  const [editingMessageId, setEditingMessageId] = useState("");
  const [redactingMessageId, setRedactingMessageId] = useState("");

  const handleDiscardEdit = () => {
    setShowDiscardModal(false);
    setEditingMessageId("");
=======
  const [editingMessageId, setEditingMessageId] = useState('');
  const [redactingMessageId, setRedactingMessageId] = useState('');

  const handleDiscardEdit = () => {
    setShowDiscardModal(false);
    setEditingMessageId('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  const discardModal = (
    <Modal onClose={() => setShowDiscardModal(false)}>
      <ModalHeader title="Discard Changes?" />
      <ModalBody>
        <div>You cannot undo this action.</div>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              label="Discard"
              type="submit"
              variant="primary"
              onClick={handleDiscardEdit}
              key="1"
            />,
            <ModalButton
              label="Cancel"
              variant="secondary"
              closesModal
              key="2"
            />,
          ]}
        />
      </ModalBody>
    </Modal>
  );

  const handleShowRedactModal = (messageId) => {
    setRedactingMessageId(messageId);
    setShowRedactModal(true);
  };

  const handleCloseRedactModal = () => {
<<<<<<< HEAD
    setRedactingMessageId("");
=======
    setRedactingMessageId('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    setShowRedactModal(false);
  };

  const redact = async () => {
    await redactChannelMessage(channelArn, redactingMessageId, userId);
    setShowRedactModal(false);
  };

  const redactModal = (
    <Modal onClose={handleCloseRedactModal}>
      <ModalHeader title="Delete Message?" />
      <ModalBody>
        <div>You cannot undo this action.</div>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              label="Delete"
              type="submit"
              variant="primary"
              onClick={redact}
              key="1"
            />,
            <ModalButton
              label="Cancel"
              variant="secondary"
              closesModal
              key="2"
            />,
          ]}
        />
      </ModalBody>
    </Modal>
  );
<<<<<<< HEAD

=======
  
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const cancelEdit = (e) => {
    e.preventDefault();
    setShowDiscardModal(true);
  };

  const saveEdit = async (e, newText, metadata) => {
    e.preventDefault();
    await updateChannelMessage(
      channelArn,
      editingMessageId,
      newText,
      metadata,
      userId
    );
<<<<<<< HEAD
    setEditingMessageId("");
  };

  const flattenedMessages = messages.map((m) => {
    const content = !m.Content || m.Redacted ? "(Deleted)" : m.Content;
=======
    setEditingMessageId('');
  };

  const flattenedMessages = messages.map((m) => {
    const content = !m.Content || m.Redacted ? '(Deleted)' : m.Content;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    let editedNote;
    if (m.LastEditedTimestamp && !m.Redacted) {
      const time = formatTime(m.LastEditedTimestamp);
      const date = formatDate(
        m.LastEditedTimestamp,
        undefined,
        undefined,
<<<<<<< HEAD
        "today",
        "yesterday"
      );
      editedNote = (
        <i style={{ fontStyle: "italic" }}>{` (edited ${date} at ${time})`}</i>
=======
        'today',
        'yesterday'
      );
      editedNote = (
        <i style={{ fontStyle: 'italic' }}>{` (edited ${date} at ${time})`}</i>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      );
    }
    return {
      content: content,
      editedNote: editedNote,
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

    if (m.Metadata) {
      let metadata = JSON.parse(m.Metadata);
      if (metadata.isMeetingInfo) {
        return m;
<<<<<<< HEAD
      }
    }

    const variant =
      createMemberArn(userId) === m.senderId ? "outgoing" : "incoming";
    let actions = null;
    if (variant === "outgoing") {
=======
      };
    }
 
    const variant =
      createMemberArn(userId) === m.senderId ? 'outgoing' : 'incoming';
    let actions = null;
    if (variant === 'outgoing') {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      actions = [
        <PopOverItem
          key="1"
          children={<span>Edit</span>}
          onClick={() => setEditingMessageId(m.messageId)}
        />,
        <PopOverItem
          key="2"
          children={<span>Delete</span>}
          onClick={() => handleShowRedactModal(m.messageId)}
        />,
      ];
    }

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

    const attachment = (metadata) => {
      try {
        const metadataJSON = JSON.parse(metadata);
        return metadataJSON?.attachments[0];
      } catch (err) {
        // not an json object! ignoring
      }
      return false;
    };

    return (
      <div className="message">
        <ChatBubbleContainer
          timestamp={formatTime(m.createdTimestamp)}
          actions={actions}
          key={`message${i.toString()}`}
          css="margin: 1rem;"
        >
          {editingMessageId === m.messageId && !m.redacted ? (
            <EditableChatBubble
              variant={variant}
              senderName={m.senderName}
              content={m.content}
              save={(event, value) => saveEdit(event, value, m.metadata)}
              cancel={cancelEdit}
              showName={showName}
              showTail={showTail}
            />
          ) : (
            <ChatBubble
              variant={variant}
              senderName={m.senderName}
              redacted={m.redacted}
              showName={showName}
              showTail={showTail}
            >
              <div>
                {m.content}
                {m.editedNote}
              </div>
              {m.metadata && attachment(m.metadata) && (
<<<<<<< HEAD
                <div style={{ marginTop: "10px" }}>
=======
                <div style={{ marginTop: '10px' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                  <AttachmentProcessor
                    senderId={m.senderId}
                    {...attachment(m.metadata)}
                  />
                </div>
              )}
            </ChatBubble>
          )}
        </ChatBubbleContainer>
      </div>
    );
  });

  return (
    <div className="message-list-container">
      {showDiscardModal && discardModal}
      {showRedactModal && redactModal}
      <div className="message-list-header">{channelName}</div>
      <InfiniteList
<<<<<<< HEAD
        style={{ display: "flex", flexGrow: "1" }}
=======
        style={{ display: 'flex', flexGrow: '1' }}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        items={messageList}
        onLoad={handleScrollTop}
        isLoading={isLoading}
        className="chat-message-list"
      />
    </div>
  );
};
export default Messages;
