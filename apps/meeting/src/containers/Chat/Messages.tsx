import React, { useEffect, useRef } from 'react';
import { ChatBubble } from 'amazon-chime-sdk-component-library-react';
import { useDataMessages } from '../../providers/DataMessagesProvider';
import { StyledMessages } from './Styled';

export default function Messages() {
  const { messages } = useDataMessages();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const renderMessages = () => {
    return messages.map((message) => (
      <ChatBubble
        variant={message.isSelf ? 'outgoing' : 'incoming'}
        senderName={message.senderName}
        key={message.timestamp}
        marginLeft="1rem"
        showTail={message.isSelf ? true : false}
      >
        {message.message}
      </ChatBubble>
    ));
  };

  return <StyledMessages ref={scrollRef}>{renderMessages()}</StyledMessages>;
}
