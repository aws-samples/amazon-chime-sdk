// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, ReactNode } from "react";
import { logger } from "../meetingConfig";
import { VideoPriorityBasedPolicy } from "amazon-chime-sdk-js";
import { MeetingMode, Layout, BlurValues } from "../types";

type Props = {
  children: ReactNode;
};

interface AppStateValue {
  meetingId: string;
  localUserName: string;
  theme: string;
  region: string;
  isWebAudioEnabled: boolean;
  blurOption: string;
  meetingMode: MeetingMode;
  enableSimulcast: boolean;
  priorityBasedPolicy: VideoPriorityBasedPolicy | undefined;
  layout: Layout;
  toggleTheme: () => void;
  toggleWebAudio: () => void;
  toggleSimulcast: () => void;
  togglePriorityBasedPolicy: () => void;
  setBlurValue: (blurValue: string) => void;
  setMeetingMode: React.Dispatch<React.SetStateAction<MeetingMode>>;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  setMeetingId: React.Dispatch<React.SetStateAction<string>>;
  setLocalUserName: React.Dispatch<React.SetStateAction<string>>;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return state;
}



const query = new URLSearchParams(location.search);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AppStateProvider({ children }: Props) {
  const [meetingId, setMeetingId] = useState(query.get("meetingId") || "");
  const [region, setRegion] = useState(query.get("region") || "");
  const [meetingMode, setMeetingMode] = useState(MeetingMode.Attendee);
  const [layout, setLayout] = useState(Layout.Gallery);
  const [localUserName, setLocalUserName] = useState("");
  const [isWebAudioEnabled, setIsWebAudioEnabled] = useState(true);
  const [priorityBasedPolicy, setPriorityBasedPolicy] = useState<VideoPriorityBasedPolicy| undefined>(undefined);
  const [enableSimulcast, setEnableSimulcast] = useState(false);
  const [blurOption, setBlur] = useState(BlurValues.blurDisabled);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme || "light";
  });

  const toggleTheme = (): void => {
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
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

  const setBlurValue = (blurValue: string): void  => {
    setBlur(blurValue);
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    isWebAudioEnabled,
    blurOption,
    region,
    meetingMode,
    layout,
    enableSimulcast,
    priorityBasedPolicy,
    toggleTheme,
    toggleWebAudio,
    togglePriorityBasedPolicy,
    toggleSimulcast,
    setBlurValue,
    setMeetingMode,
    setLayout,
    setMeetingId,
    setLocalUserName,
    setRegion
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}
