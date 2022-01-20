// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode, useEffect } from 'react';
import { logger } from '../meetingConfig';
import { VideoPriorityBasedPolicy } from 'amazon-chime-sdk-js';
import { MeetingMode, Layout, VideoFiltersCpuUtilization } from '../types';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  localUserName: string;
  theme: string;
  region: string;
  isWebAudioEnabled: boolean;
  videoTransformCpuUtilization: string;
  imageBlob: Blob | undefined;
  meetingMode: MeetingMode;
  enableSimulcast: boolean;
  priorityBasedPolicy: VideoPriorityBasedPolicy | undefined;
  layout: Layout;
  toggleTheme: () => void;
  toggleWebAudio: () => void;
  toggleSimulcast: () => void;
  togglePriorityBasedPolicy: () => void;
  setCpuUtilization: (videoTransformCpuUtilization: string) => void;
  setMeetingMode: React.Dispatch<React.SetStateAction<MeetingMode>>;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  setMeetingId: React.Dispatch<React.SetStateAction<string>>;
  setLocalUserName: React.Dispatch<React.SetStateAction<string>>;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  setBlob: (imageBlob: Blob) => void;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}



const query = new URLSearchParams(location.search);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AppStateProvider({ children }: Props) {
  const [meetingId, setMeetingId] = useState(query.get('meetingId') || '');
  const [region, setRegion] = useState(query.get('region') || '');
  const [meetingMode, setMeetingMode] = useState(MeetingMode.Attendee);
  const [layout, setLayout] = useState(Layout.Gallery);
  const [localUserName, setLocalUserName] = useState('');
  const [isWebAudioEnabled, setIsWebAudioEnabled] = useState(true);
  const [priorityBasedPolicy, setPriorityBasedPolicy] = useState<VideoPriorityBasedPolicy| undefined>(undefined);
  const [enableSimulcast, setEnableSimulcast] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });
  const [videoTransformCpuUtilization, setCpuPercentage] = useState(VideoFiltersCpuUtilization.CPU40Percent);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  
  useEffect(() => {
    /* Load a canvas that will be used as the replacement image for Background Replacement */
    async function loadImage(){
      const canvas = document.createElement('canvas');
      canvas.width = 500; 
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if(ctx !== null){
        const grd = ctx.createLinearGradient(0, 0, 250, 0);
        grd.addColorStop(0, '#000428');
        grd.addColorStop(1, '#004e92');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 500, 500);
        canvas.toBlob(function(blob){
          if(blob !== null){
            console.log('loaded canvas', canvas, blob);
            setImageBlob(blob);
          }
        });
      }
    }
    loadImage();
  }, []);

  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleWebAudio = (): void  => {
    setIsWebAudioEnabled(current => !current);
  };

  const toggleSimulcast = (): void => {
    setEnableSimulcast(current => !current);
  };

  const togglePriorityBasedPolicy = (): void => {
    if (priorityBasedPolicy) {
      setPriorityBasedPolicy(undefined);
    } else {
      setPriorityBasedPolicy(new VideoPriorityBasedPolicy(logger));
    }
  };

  const setCpuUtilization = (filterValue: string): void => {
    setCpuPercentage(filterValue);
  };

  const setBlob = (imageBlob: Blob): void => {
    setImageBlob(imageBlob);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    isWebAudioEnabled,
    videoTransformCpuUtilization,
    imageBlob,
    region,
    meetingMode,
    layout,
    enableSimulcast,
    priorityBasedPolicy,
    toggleTheme,
    toggleWebAudio,
    togglePriorityBasedPolicy,
    toggleSimulcast,
    setCpuUtilization,
    setMeetingMode,
    setLayout,
    setMeetingId,
    setLocalUserName,
    setRegion,
    setBlob,
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}
