// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { ChatBubble, } from "amazon-chime-sdk-component-library-react";

import { useChatChannelState, } from "../../providers/ChatMessagesProvider";

import "./index.css";

const TypingIndicatorSection = styled.div`
  background-color: #f0f1f2;
  padding: 1rem;
`;

const TypingIndicator = () => {
  const {
    typingIndicator,
    setTypingIndicator,
  } = useChatChannelState();

  useEffect(() => {
    if (typingIndicator) {
      (async function x() {
        setTimeout(() => {
          setTypingIndicator(null);
        }, 3000)
      })();
    }
  }, [typingIndicator]);

  return (
    <>
      {typingIndicator && (
        <TypingIndicatorSection>
          <div className="message">
            <ChatBubble
              variant={'incoming'}
              senderName={typingIndicator.SenderName}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </ChatBubble>
          </div>
        </TypingIndicatorSection>
      )}
    </>
  );
};

export default TypingIndicator;
