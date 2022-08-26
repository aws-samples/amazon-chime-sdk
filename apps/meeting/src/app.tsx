// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  NotificationProvider,
  GlobalStyles,
  LoggerProvider,
} from 'amazon-chime-sdk-component-library-react';

import { demoDarkTheme, defaultTheme } from './theme/demoTheme';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import ErrorProvider from './providers/ErrorProvider';
import Notifications from './containers/Notifications';
import MeetingProviderWrapper from './containers/MeetingProviderWrapper';
import meetingConfig from './meetingConfig';

const App: FC = () => (
  <Router>
    <LoggerProvider logger={meetingConfig.logger}>
      <AppStateProvider>
        <Theme>
          <NotificationProvider>
            <Notifications />
            <ErrorProvider>
              <MeetingProviderWrapper />
            </ErrorProvider>
          </NotificationProvider>
        </Theme>
      </AppStateProvider>
    </LoggerProvider>
  </Router>
);

const Theme: React.FC = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === 'light' ? defaultTheme : demoDarkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default App;
