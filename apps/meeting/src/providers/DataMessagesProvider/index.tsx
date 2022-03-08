import { useAudioVideo, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { DataMessage } from 'amazon-chime-sdk-js';
import React, { useEffect, useReducer, createContext, useContext, FC, useCallback } from 'react';
import { DATA_MESSAGE_LIFETIME_MS, DATA_MESSAGE_TOPIC } from '../../constants';
import { useAppState } from '../AppStateProvider';
import { DataMessagesActionType, initialState, ChatDataMessage, reducer } from './state';

interface DataMessagesStateContextType {
  sendMessage: (message: string) => void;
  messages: ChatDataMessage[];
}

const DataMessagesStateContext = createContext<DataMessagesStateContextType | undefined>(undefined);

export const DataMessagesProvider: FC = ({ children }) => {
  const { localUserName } = useAppState();
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    audioVideo.realtimeSubscribeToReceiveDataMessage(DATA_MESSAGE_TOPIC, handler);
    return () => {
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage(DATA_MESSAGE_TOPIC);
    };
  }, [audioVideo]);

  const handler = useCallback(
    (dataMessage: DataMessage) => {
      if (!dataMessage.throttled) {
        const isSelf =
          dataMessage.senderAttendeeId === meetingManager.meetingSession?.configuration.credentials?.attendeeId;
        if (isSelf) {
          dispatch({
            type: DataMessagesActionType.ADD,
            payload: {
              message: new TextDecoder().decode(dataMessage.data),
              senderAttendeeId: dataMessage.senderAttendeeId,
              timestamp: dataMessage.timestampMs,
              senderName: dataMessage.senderExternalUserId,
              isSelf: true,
            },
          });
        } else {
          const data = dataMessage.json();
          dispatch({
            type: DataMessagesActionType.ADD,
            payload: {
              message: data.message,
              senderAttendeeId: dataMessage.senderAttendeeId,
              timestamp: dataMessage.timestampMs,
              senderName: data.senderName,
              isSelf: false,
            },
          });
        }
      } else {
        console.warn('DataMessage is throttled. Please resend');
      }
    },
    [meetingManager]
  );

  const sendMessage = useCallback(
    (message: string) => {
      if (!meetingManager || !audioVideo) {
        return;
      }
      const payload = { message, senderName: localUserName };
      audioVideo.realtimeSendDataMessage(DATA_MESSAGE_TOPIC, payload, DATA_MESSAGE_LIFETIME_MS);
      handler(
        new DataMessage(
          Date.now(),
          DATA_MESSAGE_TOPIC,
          new TextEncoder().encode(message),
          meetingManager.meetingSession?.configuration?.credentials?.attendeeId!,
          localUserName
        )
      );
    },
    [meetingManager, audioVideo]
  );

  const value = {
    sendMessage,
    messages: state.messages,
  };
  return <DataMessagesStateContext.Provider value={value}>{children}</DataMessagesStateContext.Provider>;
};

export const useDataMessages = (): {
  sendMessage: (message: string) => void;
  messages: ChatDataMessage[];
} => {
  const meetingManager = useMeetingManager();
  const context = useContext(DataMessagesStateContext);
  if (!meetingManager || !context) {
    throw new Error(
      'Use useDataMessages hook inside DataMessagesProvider. Wrap DataMessagesProvider under MeetingProvider.'
    );
  }
  return context;
};
