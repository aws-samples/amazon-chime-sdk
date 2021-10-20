// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useState } from "react";
const AppStateContext = React.createContext();

export const AppStateProvider = ({ children }) => {
  const setAppMeetingInfo = (meetingId, name) => {
    setMeeting(meetingId);
    setLocalName(name);
  };

  // Meeting ID
  const [meetingId, setMeeting] = useState(() => {
    const storedMeetingId = localStorage.getItem("meetingId");
    return storedMeetingId || "";
  });

  // UserName
  const [localUserName, setLocalName] = useState(() => {
    const storedUserName = localStorage.getItem("localUserName");
    return storedUserName || "";
  });

  // Theme
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme || "light";
  });

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    toggleTheme,
    setAppMeetingInfo,
  };

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return state;
}
