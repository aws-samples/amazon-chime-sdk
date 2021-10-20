// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useContext, useState } from "react";
const AppStateContext = React.createContext();

export const AppStateProvider = ({ children }) => {
=======
import React, { useContext, useState } from 'react';
const AppStateContext = React.createContext();

export const AppStateProvider = ({ children }) => {

>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const setAppMeetingInfo = (meetingId, name) => {
    setMeeting(meetingId);
    setLocalName(name);
  };

  // Meeting ID
  const [meetingId, setMeeting] = useState(() => {
<<<<<<< HEAD
    const storedMeetingId = localStorage.getItem("meetingId");
    return storedMeetingId || "";
=======
    const storedMeetingId = localStorage.getItem('meetingId');
    return storedMeetingId || '';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });

  // UserName
  const [localUserName, setLocalName] = useState(() => {
<<<<<<< HEAD
    const storedUserName = localStorage.getItem("localUserName");
    return storedUserName || "";
=======
    const storedUserName = localStorage.getItem('localUserName');
    return storedUserName || '';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });

  // Theme
  const [theme, setTheme] = useState(() => {
<<<<<<< HEAD
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
=======
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light';
  });

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('theme', 'light');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  };

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    toggleTheme,
<<<<<<< HEAD
    setAppMeetingInfo,
=======
    setAppMeetingInfo
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
    throw new Error("useAppState must be used within AppStateProvider");
=======
    throw new Error('useAppState must be used within AppStateProvider');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  }

  return state;
}
