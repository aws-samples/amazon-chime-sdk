import { Input } from 'amazon-chime-sdk-component-library-react';
import React, { ChangeEvent, useState } from 'react';
import { useDataMessages } from '../../providers/DataMessagesProvider';
import { StyledChatInputContainer } from './Styled';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, sendCustomMessage } = useDataMessages();

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // TODO: Due to mismatch in React versions installed in demo vs the one onKeyPress accepts in component library
  // there is a problem with KeyboardEvent type here.
  // For now use, any as type and cast internally to KeyboardEvent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyPress = (event: any) => {
    const pressedKey = (event as KeyboardEvent).key;
    if (pressedKey === 'Enter') {
      sendMessage(message);
      setMessage('');
    }
    if (pressedKey === '\\') {
      sendCustomMessage('custom1', {k1: 'v1', message: message});
      setMessage('');
    }
  };

  return (
    <StyledChatInputContainer>
      <Input
        value={message}
        onChange={handleMessageChange}
        onKeyPress={handleKeyPress}
        placeholder="Message all attendees"
      />
    </StyledChatInputContainer>
  );
}
