// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode } from 'react';
import { VideoPriorityBasedPolicy } from 'amazon-chime-sdk-js';
import {
  MeetingMode,
  Layout,
} from '../types';
import { VideoFiltersCpuUtilization } from '../constants';
import { JoinMeetingInfo } from '../utils/api';
import { useLogger } from 'amazon-chime-sdk-component-library-react';

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  localUserName: string;
  theme: string;
  region: string;
  isVoiceFocusDesired: boolean;
  isVoiceFocusEnabled: boolean;
  videoTransformCpuUtilization: string;
  isEchoReductionEnabled: boolean;
  meetingMode: MeetingMode;
  enableSimulcast: boolean;
  priorityBasedPolicy: VideoPriorityBasedPolicy | undefined;
  keepLastFrameWhenPaused: boolean;
  layout: Layout;
  joinInfo: JoinMeetingInfo | undefined;
  enableMaxContentShares: boolean;
  /** The selected background segmentation effect (persisted across preview → meeting). */
  selectedEffect: string;
  setSelectedEffect: React.Dispatch<React.SetStateAction<string>>;
  toggleTheme: () => void;
  toggleVoiceFocusDesired: () => void;
  setIsVoiceFocusEnabled: (enabled: boolean) => void;
  toggleSimulcast: () => void;
  togglePriorityBasedPolicy: () => void;
  toggleKeepLastFrameWhenPaused: () => void;
  toggleMaxContentShares: () => void;
  setCpuUtilization: (videoTransformCpuUtilization: string) => void;
  toggleEchoReduction: () => void;
  setMeetingMode: React.Dispatch<React.SetStateAction<MeetingMode>>;
  setJoinInfo: (joinInfo: JoinMeetingInfo | undefined) => void;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  setMeetingId: React.Dispatch<React.SetStateAction<string>>;
  setLocalUserName: React.Dispatch<React.SetStateAction<string>>;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  skipDeviceSelection: boolean;
  toggleMeetingJoinDeviceSelection: () => void;
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
  const logger = useLogger();
  const [meetingId, setMeetingId] = useState(query.get('meetingId') || '');
  const [region, setRegion] = useState(query.get('region') || '');
  const [meetingMode, setMeetingMode] = useState(MeetingMode.Attendee);
  const [joinInfo, setJoinInfo] = useState<JoinMeetingInfo | undefined>(undefined);
  const [layout, setLayout] = useState(Layout.Gallery);
  const [localUserName, setLocalUserName] = useState('');
  const [isVoiceFocusDesired, setIsVoiceFocusDesired] = useState(false);
  const [isVoiceFocusEnabled, setIsVoiceFocusEnabled] = useState(false);
  const [priorityBasedPolicy, setPriorityBasedPolicy] = useState<VideoPriorityBasedPolicy | undefined>(undefined);
  const [enableSimulcast, setEnableSimulcast] = useState(false);
  const [keepLastFrameWhenPaused, setKeepLastFrameWhenPaused] = useState(false);
  const [isEchoReductionEnabled, setIsEchoReductionEnabled] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });
  const [videoTransformCpuUtilization, setCpuPercentage] = useState(VideoFiltersCpuUtilization.CPU40Percent);
  const [skipDeviceSelection, setSkipDeviceSelection] = useState(false);
  const [enableMaxContentShares, setEnableMaxContentShares] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');

  const toggleTheme = (): void => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMeetingJoinDeviceSelection = (): void => {
    setSkipDeviceSelection((current) => !current);
  };

  const toggleVoiceFocusDesired = (): void => {
    setIsVoiceFocusDesired((current) => !current);
  };

  const toggleSimulcast = (): void => {
    setEnableSimulcast((current) => !current);
  };

  const togglePriorityBasedPolicy = (): void => {
    if (priorityBasedPolicy) {
      setPriorityBasedPolicy(undefined);
    } else {
      setPriorityBasedPolicy(new VideoPriorityBasedPolicy(logger));
    }
  };

  const toggleKeepLastFrameWhenPaused = (): void => {
    setKeepLastFrameWhenPaused((current) => !current);
  };

  const setCpuUtilization = (filterValue: string): void => {
    setCpuPercentage(filterValue);
  };

  const toggleEchoReduction = (): void => {
    setIsEchoReductionEnabled((current) => !current);
  };

  const toggleMaxContentShares = (): void => {
    setEnableMaxContentShares((current) => !current);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    videoTransformCpuUtilization,
    isEchoReductionEnabled,
    isVoiceFocusDesired,
    isVoiceFocusEnabled,
    region,
    meetingMode,
    layout,
    joinInfo,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    toggleTheme,
    toggleVoiceFocusDesired,
    setIsVoiceFocusEnabled,
    togglePriorityBasedPolicy,
    toggleKeepLastFrameWhenPaused,
    toggleSimulcast,
    setCpuUtilization,
    toggleEchoReduction,
    setMeetingMode,
    setLayout,
    setJoinInfo,
    setMeetingId,
    setLocalUserName,
    setRegion,
    skipDeviceSelection,
    toggleMeetingJoinDeviceSelection,
    enableMaxContentShares,
    toggleMaxContentShares,
    selectedEffect,
    setSelectedEffect,
  };

  return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
}
