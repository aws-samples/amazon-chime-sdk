import {
  ChannelMessagePersistenceType,
  ChannelMessageStatus,
  ChannelMessageType,
  SendChannelMessageCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { Message, MessagingSession, MessagingSessionObserver } from 'amazon-chime-sdk-js';
import { memo, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import classnames from 'classnames';

import { useAuth } from '../providers/AuthProvider';
import { useAwsClient } from '../providers/AwsClientProvider';
import { MessageMetadata, MessageWrapper } from '../types';
import './ChatMessage.css';
import useMountedRef from '../hooks/useMountedRef';

dayjs.extend(calendar);

// Use React.memo to render only when props change. To test, do the following steps:
// 1. Specify { MaxResults: 1 } in the ListChannelMessages API call in the Chat component.
// 2. Put console.log() in the ChatMessage component.
// 3. Send a new message and ensure that only a new ChatMessage component renders.
export default memo(function ChatMessage({
  channelArn,
  clientId,
  messagingSession,
  messageWrapper,
  hideName,
}: {
  channelArn: string;
  clientId: string;
  messagingSession: MessagingSession;
  messageWrapper: MessageWrapper;
  hideName: boolean;
}): JSX.Element {
  const { messagingClient } = useAwsClient();
  const { appInstanceUserArn } = useAuth();
  const [failed, setFailed] = useState<boolean>(false);
  const mountedRef = useMountedRef();

  // The ChatMessage component will send a local message.
  const [sent, setSent] = useState<boolean>(!messageWrapper.local);

  useEffect(() => {
    if (sent) {
      return;
    }

    let observer: MessagingSessionObserver;
    (async () => {
      try {
        const data = await messagingClient.send(
          new SendChannelMessageCommand({
            ChannelArn: channelArn,
            // TODO: Check with the Chime SDK messaging team why AWS SDK for JavaScript v3
            // throws a signature error for Emoji content. encodeURIComponent mitigates the issue.
            Content: encodeURIComponent(messageWrapper.content),
            ChimeBearer: appInstanceUserArn,
            Type: ChannelMessageType.STANDARD,
            Persistence: ChannelMessagePersistenceType.PERSISTENT,
            Metadata: JSON.stringify({
              clientId,
              temporaryId: messageWrapper.messageId,
            } as MessageMetadata),
          })
        );
        if (!mountedRef.current) {
          return;
        } else if (data.Status?.Value === ChannelMessageStatus.SENT) {
          setSent(true);
        } else if (
          data.Status?.Value === ChannelMessageStatus.FAILED ||
          data.Status?.Value === ChannelMessageStatus.DENIED
        ) {
          throw new Error(
            `${data.Status?.Value}: Processing failed because the processor Lambda function is unreachable. The message won't be sent.`
          );
        } else if (data.Status?.Value === ChannelMessageStatus.PENDING) {
          observer = {
            messagingSessionDidReceiveMessage: (message: Message) => {
              if (message.headers['x-amz-chime-message-type'] === 'CONTROL') {
                return;
              }
              const payload = JSON.parse(message.payload);
              const metadata = JSON.parse(payload.Metadata) as MessageMetadata;

              if (
                !mountedRef.current ||
                payload.ChannelArn !== channelArn ||
                metadata.presence ||
                metadata.clientId !== clientId ||
                metadata.temporaryId !== messageWrapper.messageId
              ) {
                return;
              }

              if (message.type === 'CREATE_CHANNEL_MESSAGE') {
                messagingSession.removeObserver(observer);
                setSent(true);
              } else if (
                message.type === 'FAILED_CREATE_CHANNEL_MESSAGE' ||
                message.type === 'DENIED_CREATE_CHANNEL_MESSAGE'
              ) {
                messagingSession.removeObserver(observer);
                setFailed(true);
              }
            },
          };
          messagingSession.addObserver(observer);
        }
      } catch (error: any) {
        console.error(error);
        setFailed(true);
      }
    })();
    return () => {
      messagingSession.removeObserver(observer);
    };
  }, [appInstanceUserArn, channelArn, clientId, messageWrapper, messagingClient, messagingSession, mountedRef, sent]);

  return (
    <li
      id={messageWrapper.messageId}
      className={classnames('ChatMessage', {
        'ChatMessage--hiddenName': hideName,
      })}
    >
      {!hideName && (
        <div className="ChatMessage__senderContainer">
          <span className="ChatMessage__sender">{messageWrapper.senderName}</span>
          <span className="ChatMessage__time">{dayjs(messageWrapper.createdTimestamp).format('LT')}</span>
        </div>
      )}
      <div className="ChatMessage__content">
        {messageWrapper.content}
        {failed && <span className="ChatMessage__failed">{` (failed)`}</span>}
      </div>
    </li>
  );
});
