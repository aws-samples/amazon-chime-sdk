// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode, useEffect } from 'react';
import { VideoPriorityBasedPolicy } from 'amazon-chime-sdk-js';
import { MeetingMode, Layout, VideoFiltersCpuUtilization, ReplacementOptions, ReplacementType, ReplacementDropdownOptionType } from '../types';
import { JoinMeetingInfo } from '../utils/api';
import { useLogger } from 'amazon-chime-sdk-component-library-react';
import { createBlob } from '../utils/background-replacement';

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
  isEchoReductionEnabled: boolean;
  meetingMode: MeetingMode;
  enableSimulcast: boolean;
  priorityBasedPolicy: VideoPriorityBasedPolicy | undefined;
  keepLastFrameWhenPaused: boolean;
  layout: Layout;
  joinInfo: JoinMeetingInfo | undefined;
  backgroundReplacementOption: ReplacementOptions;
  replacementOptionsList: ReplacementDropdownOptionType[];
  enableMaxContentShares: boolean;
  showAnnotatedContentShare: boolean;
  toggleTheme: () => void;
  toggleWebAudio: () => void;
  toggleSimulcast: () => void;
  togglePriorityBasedPolicy: () => void;
  toggleKeepLastFrameWhenPaused: () => void;
  toggleMaxContentShares: () => void;
  toggleAnnotatedContentShare: () => void;
  setCpuUtilization: (videoTransformCpuUtilization: string) => void;
  toggleEchoReduction: () => void;
  setMeetingMode: React.Dispatch<React.SetStateAction<MeetingMode>>;
  setJoinInfo: (joinInfo: JoinMeetingInfo | undefined) => void;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  setMeetingId: React.Dispatch<React.SetStateAction<string>>;
  setLocalUserName: React.Dispatch<React.SetStateAction<string>>;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  setBlob: (imageBlob: Blob) => void;
  skipDeviceSelection: boolean;
  toggleMeetingJoinDeviceSelection: () => void;
  setBackgroundReplacementOption: React.Dispatch<React.SetStateAction<ReplacementOptions>>;
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
  const [isWebAudioEnabled, setIsWebAudioEnabled] = useState(true);
  const [priorityBasedPolicy, setPriorityBasedPolicy] = useState<VideoPriorityBasedPolicy | undefined>(undefined);
  const [enableSimulcast, setEnableSimulcast] = useState(false);
  const [keepLastFrameWhenPaused, setKeepLastFrameWhenPaused] = useState(false);
  const [isEchoReductionEnabled, setIsEchoReductionEnabled] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });
  const [videoTransformCpuUtilization, setCpuPercentage] = useState(VideoFiltersCpuUtilization.CPU40Percent);
  const [imageBlob, setImageBlob] = useState<Blob | undefined>(undefined);
  const [skipDeviceSelection, setSkipDeviceSelection] = useState(false);
  const [backgroundReplacementOption, setBackgroundReplacementOption] = useState<ReplacementOptions>(ReplacementOptions.Blue);
  const [enableMaxContentShares, setEnableMaxContentShares] = useState(false);
  const [showAnnotatedContentShare, setShowAnnotatedContentShare] = useState(false);

  const replacementOptionsList: ReplacementDropdownOptionType[] = [
    {
      label: ReplacementOptions.Blue,
      type: ReplacementType.Color,
      value: '#0000ff',
    },
    {
      label: ReplacementOptions.Beach,
      type: ReplacementType.Image,
      value: ReplacementOptions.Beach,
    },
  ];

  useEffect(() => {
    /* Load a canvas that will be used as the replacement image for Background Replacement */
    async function loadImage() {
      const option = replacementOptionsList.find(option => backgroundReplacementOption === option.label);
      if (option) {
        const blob = await createBlob(option);
        setImageBlob(blob);
      } else {
        logger.error(`Error: Cannot find ${backgroundReplacementOption} in the replacementOptionsList: ${replacementOptionsList}`);
      }
    }
    loadImage();
  }, [backgroundReplacementOption]);

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

  const toggleWebAudio = (): void => {
    setIsWebAudioEnabled((current) => !current);
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

  const setBlob = (imageBlob: Blob): void => {
    setImageBlob(imageBlob);
  };

  const toggleEchoReduction = (): void => {
    setIsEchoReductionEnabled((current) => !current);
  };

  const toggleMaxContentShares = (): void => {
    setEnableMaxContentShares((current) => !current);
  };

  const toggleAnnotatedContentShare = (): void => {
    setShowAnnotatedContentShare((current) => !current);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    isWebAudioEnabled,
    videoTransformCpuUtilization,
    imageBlob,
    isEchoReductionEnabled,
    region,
    meetingMode,
    layout,
    joinInfo,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    toggleTheme,
    toggleWebAudio,
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
    setBlob,
    skipDeviceSelection,
    toggleMeetingJoinDeviceSelection,
    backgroundReplacementOption,
    setBackgroundReplacementOption,
    replacementOptionsList,
    enableMaxContentShares,
    toggleMaxContentShares,
    showAnnotatedContentShare,
    toggleAnnotatedContentShare,
  };

  return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
}
