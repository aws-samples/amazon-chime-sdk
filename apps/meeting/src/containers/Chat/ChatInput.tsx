import { Input } from 'amazon-chime-sdk-component-library-react';
import React, { ChangeEvent, useState } from 'react';
import { StyledChatInputContainer } from './Styled';

interface Props {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState('');

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // TODO: Due to mismatch in React versions installed in demo vs the one onKeyPress accepts in component library
  // there is a problem with KeyboardEvent type here.
  // For now use, any as type and cast internally to KeyboardEvent.
  const handleKeyPress = (event: any) => {
    if ((event as KeyboardEvent).key === 'Enter') {
      onSend(message);
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
