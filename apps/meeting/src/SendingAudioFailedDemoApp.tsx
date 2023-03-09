// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  GlobalStyles,
  LoggerProvider,
  MeetingProvider,
} from 'amazon-chime-sdk-component-library-react';

import { demoLightTheme } from './theme/demoTheme';
import meetingConfig from './meetingConfig';
import SendingAudioFailedReproMeetingScreen from './SendingAudioFailedReproMeetingScreen';

const SendingAudioFailedDemoApp: FC = () => (
  <Router>
    <LoggerProvider logger={meetingConfig.logger}>
      <Theme>
        <MeetingProvider>
          <SendingAudioFailedReproMeetingScreen />
        </MeetingProvider>
      </Theme>
    </LoggerProvider>
  </Router>
);

const Theme: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={demoLightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default SendingAudioFailedDemoApp;
