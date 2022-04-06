import styled from 'styled-components';

export const StyledChat = styled.aside`
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'chat-header'
    'messages'
    'chat-input';
  width: 100%;
  height: 100%;
  padding-bottom: 1rem;
  overflow-y: auto;
  background-color: ${(props) => props.theme.chat.bgd};
  box-shadow: 1rem 1rem 3.75rem 0 rgba(0, 0, 0, 0.1);
  border-top: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  border-left: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  border-right: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  ${({ theme }) => theme.mediaQueries.min.md} {
    width: ${(props) => props.theme.chat.maxWidth};
  }
`;

export const StyledTitle = styled.div`
  grid-area: chat-header;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 0.0625rem solid ${(props) => props.theme.chat.headerBorder};
  .ch-title {
    font-size: 1rem;
    color: ${(props) => props.theme.chat.primaryText};
  }
  .close-button {
    margin-left: auto;
    display: flex;
    > * {
      margin-left: 0.5rem;
    }
  }
`;

export const StyledChatInputContainer = styled.div`
  grid-area: chat-input;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;

  .ch-input-wrapper {
    width: 90%;

    .ch-input {
      width: 100%;
    }
  }
`;

export const StyledMessages = styled.div`
  grid-area: messages;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  row-gap: 0.5rem;
`;
