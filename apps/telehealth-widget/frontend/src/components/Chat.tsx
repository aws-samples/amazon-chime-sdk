import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChannelMessageSummary,
  ChannelMessageStatus,
  ListChannelMessagesCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { Message } from 'amazon-chime-sdk-js';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import './Chat.css';
import { Channel, MessageMetadata, MessageWrapper } from '../types';
import { useAuth } from '../providers/AuthProvider';
import { useAwsClient } from '../providers/AwsClientProvider';
import { useMessaging } from '../providers/MessagingProvider';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import useMountedRef from '../hooks/useMountedRef';
import { ReservedMessageContent, Presence } from '../constants';

/**
 * The demo performs the following steps to send a new message and update a list.
 *
 * 1. Type text and press the enter/return key in <ChatInput>.
 * 2. <Chat> instantly appends a fake <ChatMessage> with a temporary ID.
 * 3. The fake <ChatMessage> calls the Chime SDK SendChannelMessage API.
 * 4. <Chat> receives an original message from the messaging session (WebSocket).
 * 5. If the fake message is not the latest message in the list, <Chat> replaces
 *    the fake <ChatMessage> with the original <ChatMessage> to maintain ordering.
 */
export default function Chat({ channel }: { channel: Channel }): JSX.Element {
  const channelArn = channel.summary.ChannelArn!;

  // The last item of the "messageWrappers" array is the latest message.
  const [messageWrappers, setMessageWrappers] = useState<MessageWrapper[]>();
  const { appInstanceUserArn } = useAuth();
  const { messagingClient } = useAwsClient();
  const { clientId, messagingSession } = useMessaging();
  const mountedRef = useMountedRef();
  const { t } = useTranslation();

  const loadMoreElementRef = useRef<HTMLLIElement>(null);
  const newElementRef = useRef<HTMLLIElement>(null);
  const rootElementRef = useRef<HTMLDivElement>(null);

  // Suppose that "useEffect" depends only on the "messageWrappers" state. While "useEffect" fetches
  // more messages, the current "messageWrappers" state can have new items. To append fetched messages,
  // we need to use "useRef" to retrieve the current array.
  const messageWrappersRef = useRef<MessageWrapper[] | undefined>(messageWrappers);

  // Suppose that you send the check-in message and then list messages. The list will include
  // the check-in message, so the Chat component uses the following Set object to ignore the duplicate
  // check-in message from the messaging session (WebSocket).
  const messageIdSetRef = useRef<Set<string>>(new Set());
  const nextTokenRef = useRef<string>();

  // When a doctor chooses "Call," the MeetingDoctorView component repeats sending meeting invitation messages
  // until the MeetingPatientView component accepts or denies it. Use the following Set to show only one
  // invitation message in this Chat component.
  const invitationMeetingIdSetRef = useRef<Set<string>>(new Set());

  const listMessages = useCallback(
    async (
      nextToken?: string
    ): Promise<{
      messageWrappers: MessageWrapper[];
      nextToken?: string;
    }> => {
      try {
        const data = await messagingClient.send(
          new ListChannelMessagesCommand({
            ChannelArn: channelArn,
            ChimeBearer: appInstanceUserArn,
            NextToken: nextToken,
          })
        );
        const messageWrappers = (data.ChannelMessages || [])
          .filter((message: ChannelMessageSummary) => message.Status?.Value === ChannelMessageStatus.SENT)
          .map<MessageWrapper>((message: ChannelMessageSummary): MessageWrapper => {
            let content = message.Content!;
            try {
              content = decodeURIComponent(content);
            } catch (error: any) {
              console.warn(`Failed to decode the message content`, content, error);
            }

            // For performance, parse metadata only when the content matches the reserved string.
            if (content === ReservedMessageContent.CheckedIn) {
              try {
                const metadata: MessageMetadata = JSON.parse(message.Metadata!);
                if (metadata.presence === Presence.CheckedIn) {
                  content = t('Chat.checkedIn');
                }
              } catch (error: any) {}
            }
            
            return {
              content,
              createdTimestamp: message.CreatedTimestamp,
              messageId: message.MessageId,
              senderName: message.Sender?.Name,
              senderArn: message.Sender?.Arn,
              local: false,
            } as MessageWrapper;
          })
          .sort((message1, message2) => message1.createdTimestamp.getTime() - message2.createdTimestamp.getTime());
        return {
          messageWrappers,
          nextToken: data.NextToken,
        };
      } catch (error) {
        throw error;
      }
    },
    [appInstanceUserArn, channelArn, messagingClient, t]
  );

  useEffect(() => {
    if (!messagingSession) {
      return;
    }

    const observer = {
      messagingSessionDidReceiveMessage: (message: Message) => {
        if (message.headers['x-amz-chime-message-type'] === 'CONTROL') {
          return;
        }
        if (message.type === 'CREATE_CHANNEL_MESSAGE') {
          try {
            const payload = JSON.parse(message.payload);
            const metadata: MessageMetadata = JSON.parse(payload.Metadata);
            if (payload.ChannelArn !== channelArn) {
              return;
            } else if (messageIdSetRef.current.has(payload.MessageId)) {
              return;
            }

            /**
             *  When typing text in the chat input and pressing the enter/return key, we instantly
             *  append a "fake" message UI before calling the SendChannelMessage API in the ChatMessage component.
             *
             *  Example 1:
             *  Suppose that you send three messages: A, B, and C.
             *  The list has [fakeA, X, Y, fakeB, fakeC] where X and Y are from other users.
             *  When message A arrives from the messaging session (WebSocket), we remove the "fakeA" because
             *  X and Y are newer messages. The new list becomes [X, Y, fakeB, fakeC, A].
             *
             *  Example 2:
             *  Suppose that you send three messages: A, B, and C.
             *  The list has [X, Y, fakeA, fakeB, fakeC] where X and Y are from other users.
             *  When message A arrives from the messaging session, we do not perform any action
             *  [X, Y, fakeA, fakeB, fakeC] is the correct order in the UI the user expects to see.
             */
            if (!metadata.presence && clientId === metadata.clientId) {
              let shouldRemove: boolean = false;
              if (messageWrappersRef.current) {
                for (let i = messageWrappersRef.current.length - 1; i >= 0; i--) {
                  const messageWrapper = messageWrappersRef.current[i];
                  if (messageWrapper.messageId === metadata.temporaryId) {
                    break;
                  } else if (messageWrapper.local) {
                    continue;
                  } else if (!messageWrapper.local) {
                    shouldRemove = true;
                    break;
                  }
                }
              }
              if (shouldRemove) {
                messageWrappersRef.current = messageWrappersRef.current!.filter(
                  (messageWrapper: MessageWrapper) => messageWrapper.messageId !== metadata.temporaryId
                );
              } else {
                return;
              }
            }

            let content = payload.Content;
            try {
              content = decodeURIComponent(content);
            } catch (error) {
              console.warn(`Failed to decode the message content`, content, error);
            }
            if (metadata.isMeetingInvitation) {
              switch (content) {
                case ReservedMessageContent.AcceptedInvite:
                  content = t('Chat.acceptedInvite');
                  break;
                case ReservedMessageContent.AcceptedInviteByPhone:
                  content = t('Chat.acceptedInviteByPhone');
                  break;
                case ReservedMessageContent.CanceledInvite:
                  content = t('Chat.canceledInvite');
                  break;
                case ReservedMessageContent.DeclinedInvite:
                  content = t('Chat.declinedInvite');
                  break;
                case ReservedMessageContent.DeclinedInviteByPhone:
                  content = t('Chat.declinedInviteByPhone');
                  break;
                case ReservedMessageContent.SendingInvite:
                  if (invitationMeetingIdSetRef.current.has(metadata.meetingId!)) {
                    return;
                  }
                  content = t('Chat.sendingInvite');
                  invitationMeetingIdSetRef.current.add(metadata.meetingId!);
                  break;
              }
            } else if (metadata.presence === Presence.CheckedIn) {
              content = t('Chat.checkedIn');
            }

            const messageWrapper: MessageWrapper = {
              content,
              createdTimestamp: new Date(payload.CreatedTimestamp),
              messageId: payload.MessageId,
              senderName: payload.Sender.Name,
              senderArn: payload.Sender.Arn,
              local: false,
            };
            messageWrappersRef.current = [...messageWrappersRef.current!, messageWrapper];
            messageIdSetRef.current.add(messageWrapper.messageId);
            setMessageWrappers(messageWrappersRef.current);
          } catch (error) {
            console.error(error);
          }
        }
      },
    };

    (async () => {
      const { messageWrappers, nextToken } = await listMessages();
      if (!mountedRef.current) {
        return;
      }
      nextTokenRef.current = nextToken;
      messageWrappersRef.current = messageWrappers;
      messageIdSetRef.current = new Set(messageWrappersRef.current.map<string>(({ messageId }) => messageId));
      setMessageWrappers(messageWrappers);
      messagingSession.addObserver(observer);
    })();

    return () => {
      messagingSession?.removeObserver(observer);
    };
  }, [channelArn, clientId, listMessages, messagingSession, mountedRef, t]);

  useEffect(() => {
    const nextToken = nextTokenRef.current;
    if (!messageWrappers?.length || !nextToken) {
      return;
    }

    let observer: IntersectionObserver;
    const target = loadMoreElementRef.current;
    if (target) {
      observer = new IntersectionObserver(
        async (entries: IntersectionObserverEntry[]) => {
          if (messageWrappers && entries?.[0].isIntersecting && mountedRef.current) {
            console.warn('Load more messages');
            try {
              const data = await listMessages(nextToken);
              nextTokenRef.current = data.nextToken;
              messageWrappersRef.current = [...data.messageWrappers, ...messageWrappersRef.current!];
              messageIdSetRef.current = new Set(messageWrappersRef.current.map<string>(({ messageId }) => messageId));
              setMessageWrappers(messageWrappersRef.current);
            } catch (error) {
              console.error(error);
            }
          }
        },
        {
          root: rootElementRef.current,
          threshold: 0,
        }
      );
      observer.observe(target);
    }
    return () => {
      if (observer && target) {
        observer.unobserve(target);
      }
    };
  }, [listMessages, messageWrappers, mountedRef]);

  const previousOldestMessageRef = useRef<MessageWrapper>();
  const previousLatestMessageRef = useRef<MessageWrapper>();
  useEffect(() => {
    if (messageWrappers) {
      const latestMessage = messageWrappers[messageWrappers.length - 1];
      if (latestMessage !== previousLatestMessageRef.current) {
        newElementRef.current?.scrollIntoView();
      } else {
        if (previousOldestMessageRef?.current?.messageId) {
          // ChatMessage uses React.memo for a performance boost, so we cannot pass RefObject
          // via React.forwardRef. Use document.getElementById to get an element and keep the scroll position.
          document.getElementById(previousOldestMessageRef.current.messageId)?.scrollIntoView();
        }
      }
      previousOldestMessageRef.current = messageWrappers[0];
      previousLatestMessageRef.current = latestMessage;
    }
  }, [messageWrappers]);

  const onSubmitRequest = useCallback(
    (message: MessageWrapper) => {
      if (!mountedRef.current) {
        return;
      }
      messageWrappersRef.current = [...messageWrappersRef.current!, message];
      setMessageWrappers(messageWrappersRef.current);
    },
    [mountedRef]
  );

  const hideName = useCallback(
    (messageWrapper: MessageWrapper, previousMessgaeWrapper: MessageWrapper | undefined): boolean => {
      return (
        messageWrapper.senderArn === previousMessgaeWrapper?.senderArn &&
        dayjs(messageWrapper.createdTimestamp).diff(previousMessgaeWrapper.createdTimestamp, 'second') <= 60
      );
    },
    []
  );

  return (
    <div className="Chat" ref={rootElementRef}>
      {messagingSession && messageWrappers !== undefined && (
        <>
          <ul className="Chat__messages">
            <li style={{ minHeight: '1px', backgroundColor: 'transparent' }} ref={loadMoreElementRef}></li>
            {messageWrappers.map((messageWrapper: MessageWrapper, index: number) => (
              <ChatMessage
                key={messageWrapper.messageId}
                channelArn={channelArn}
                clientId={clientId}
                messagingSession={messagingSession}
                messageWrapper={messageWrapper}
                hideName={hideName(messageWrapper, messageWrappers[index - 1])}
              />
            ))}
            <li style={{ minHeight: '0.75rem', backgroundColor: 'transparent' }} ref={newElementRef}></li>
          </ul>
          <ChatInput
            channel={channel}
            onSubmitRequest={onSubmitRequest}
          />
        </>
      )}
    </div>
  );
}
