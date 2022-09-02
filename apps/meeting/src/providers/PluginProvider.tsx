// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useAudioVideo, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { DataMessage } from 'amazon-chime-sdk-js';
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { SLPlugin } from '../plugins/IframePlugin/pluginManager';

type Props = {
  children: ReactNode;
};

// for upcoming plugins sendCustomEvent can be used for all
// To recieve events for other plugins and store them, create
// a state like `recievedIframePluginData` below.
interface AppStateValue {
  recievedIframePluginData: any;
  sendCustomEvent: (eventData: any) => void;
}

const PluginStateContext = React.createContext<AppStateValue | null>(null);

export function usePluginState(): AppStateValue {
  const state = useContext(PluginStateContext);

  if (!state) {
    throw new Error('useAppState must be used within PluginProvider. Wrap PluginProvider under MeetingProvider');
  }

  return state;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PluginProvider({ children }: Props) {

  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [recievedIframePluginData, setRecievedIframePluginData] = useState<any>(null);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    // For every plugin a new subscriber will be made that will observe
    // events for that plugin only. Make sure to unsubscribe it too in the 
    // return function.
    audioVideo.realtimeSubscribeToReceiveDataMessage(SLPlugin.IFrame, customIFramePluginReceiveHandler);
    return () => {
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage(SLPlugin.IFrame);
    };
  }, [audioVideo]);


  // A separate action recieve handler should be made to update
  // actions for that particular plugin
  const customIFramePluginReceiveHandler = useCallback(
    (dataMessage: DataMessage) => {
      const payload = JSON.parse(new TextDecoder().decode(dataMessage.data));
      const message = dataMessage;
      const payloadToBroadcast = {payload, message};
      console.log("received inside PluginProvider:", payloadToBroadcast);
      setRecievedIframePluginData(payloadToBroadcast);
    },
    [meetingManager]
  );

  // Universal function to send custom events
  const sendCustomEvent = useCallback(
    (eventData: any) => {
      if (
        !meetingManager ||
        !meetingManager.meetingSession ||
        !meetingManager.meetingSession.configuration.credentials ||
        !meetingManager.meetingSession.configuration.credentials.attendeeId ||
        !audioVideo
      ) {
        return;
      }
      const message = eventData?.message;
      const payload = JSON.stringify(eventData?.payload);
      const dataMessageLifeTime = eventData?.dataMessageLifeTime || 3000;
      audioVideo.realtimeSendDataMessage(message, payload, dataMessageLifeTime);
    },
    [meetingManager, audioVideo]
  )

  
  const providerValue = {
    recievedIframePluginData,
    sendCustomEvent
  };

  return <PluginStateContext.Provider value={providerValue}>{children}</PluginStateContext.Provider>;
}

