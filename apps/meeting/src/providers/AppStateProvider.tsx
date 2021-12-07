// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode } from 'react';
import { MeetingMode, Layout, BlurValues } from '../types';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  localUserName: string;
  theme: string;
  region: string;
  isWebAudioEnabled: boolean;
  blurOption: string,
  isEchoReductionEnabled: boolean;
  meetingMode: MeetingMode;
  layout: Layout;
  joinInfo: any;
  toggleTheme: () => void;
  toggleWebAudio: () => void;
  setBlurValue: (blurValue: string) => void;
  toggleEchoReduction: () => void;
  setAppMeetingInfo: (meetingId: string, name: string, region: string) => void;
  setMeetingMode: (meetingMode: MeetingMode) => void;
  setJoinInfo: (joinInfo: any) => void;
  setLayout: (layout: Layout) => void;
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
  const [meetingId, setMeeting] = useState(query.get('meetingId') || '');
  const [region, setRegion] = useState(query.get('region') || '');
  const [meetingMode, setMeetingMode] = useState(MeetingMode.Attendee);
  const [joinInfo, setJoinInfo] = useState(null);
  const [layout, setLayout] = useState(Layout.Gallery);
  const [localUserName, setLocalName] = useState('');
  const [isWebAudioEnabled, setIsWebAudioEnabled] = useState(true);
  const [blurOption, setBlur] = useState(BlurValues.blurDisabled);
  const [isEchoReductionEnabled, setIsEchoReductionEnabled] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

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
  }

  const setBlurValue = (blurValue: string): void  => {
    setBlur(blurValue);
  }

  const toggleEchoReduction = (): void  => {
    setIsEchoReductionEnabled(current => !current);
  }

  const setAppMeetingInfo = (
    meetingId: string,
    name: string,
    region: string
  ): void => {
    setRegion(region);
    setMeeting(meetingId);
    setLocalName(name);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    isWebAudioEnabled,
    blurOption,
    isEchoReductionEnabled,
    region,
    meetingMode,
    layout,
    joinInfo,
    toggleTheme,
    toggleWebAudio,
    setBlurValue,
    toggleEchoReduction,
    setAppMeetingInfo,
    setMeetingMode,
    setLayout,
    setJoinInfo,
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}
