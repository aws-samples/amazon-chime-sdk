import { RosterType, useAudioVideo, useMeetingManager, useRosterState } from 'amazon-chime-sdk-component-library-react';
import { DataMessage } from 'amazon-chime-sdk-js';
import React, { useEffect, useReducer, createContext, useContext, FC, useCallback, useRef } from 'react';
import { DataMessagesActionType, initialState, ChatDataMessage, reducer } from './state';

interface DataMessagesStateContextType {
  sendMessage: (message: string) => void;
  messages: ChatDataMessage[];
}

const DataMessagesStateContext = createContext<DataMessagesStateContextType | undefined>(undefined);

export const DataMessagesProvider: FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { roster } = useRosterState();
  const rosterRef = useRef<RosterType>({});

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    audioVideo.realtimeSubscribeToReceiveDataMessage('ChimeComponentLibraryDataMessage', handler);
    return () => {
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage('ChimeComponentLibraryDataMessage');
    };
  }, [audioVideo]);

  useEffect(() => {
    if (roster) {
      rosterRef.current = { ...rosterRef.current, ...roster };
    }
  }, [roster]);

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
              senderName: rosterRef.current[dataMessage.senderAttendeeId]?.name!,
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
              senderName: rosterRef.current[dataMessage.senderAttendeeId]?.name!,
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
      const DATA_MESSAGE_LIFETIME_MS = 30000;
      const payload = { message };
      audioVideo.realtimeSendDataMessage('ChimeComponentLibraryDataMessage', payload, DATA_MESSAGE_LIFETIME_MS);
      handler(
        new DataMessage(
          Date.now(),
          'ChimeComponentLibraryDataMessage',
          new TextEncoder().encode(message),
          meetingManager.meetingSession?.configuration?.credentials?.attendeeId!,
          meetingManager.meetingSession?.configuration?.credentials?.externalUserId!
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
  const context = useContext(DataMessagesStateContext);
  if (!context) {
    throw new Error('Use useDataMessages hook inside DataMessagesProvider');
  }
  return context;
};
