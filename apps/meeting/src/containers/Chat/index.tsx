import React from 'react';
import Messages from './Messages';
import ChatInput from './ChatInput';
import { StyledChat, StyledTitle } from './Styled';
import { IconButton, Remove } from 'amazon-chime-sdk-component-library-react';
import { useNavigation } from '../../providers/NavigationProvider';
import { useDataMessages } from '../../providers/DataMessagesProvider';

export default function Chat() {
  const { toggleChat } = useNavigation();
  const { sendMessage } = useDataMessages();

  return (
    <StyledChat className="chat">
      <StyledTitle>
        <div className="ch-title">Chat</div>
        <div className="close-button">
          <IconButton icon={<Remove />} label="Close" onClick={toggleChat} />
        </div>
      </StyledTitle>
      <Messages />
      <ChatInput onSend={sendMessage} />
    </StyledChat>
  );
}
