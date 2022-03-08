// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { NotificationProvider, GlobalStyles } from 'amazon-chime-sdk-component-library-react';

import { demoLightTheme, demoDarkTheme } from './theme/demoTheme';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import ErrorProvider from './providers/ErrorProvider';
import Notifications from './containers/Notifications';
import MeetingProviderWrapper from './containers/MeetingProviderWrapper';

const App: FC = () => (
  <Router>
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
  </Router>
);

const Theme: React.FC = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === 'light' ? demoLightTheme : demoDarkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default App;
