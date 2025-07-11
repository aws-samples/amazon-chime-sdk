// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC, PropsWithChildren } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { VoiceFocusModelName } from 'amazon-chime-sdk-js';
import {
  NotificationProvider,
  GlobalStyles,
  LoggerProvider,
  VoiceFocusProvider,
} from 'amazon-chime-sdk-component-library-react';

import { demoLightTheme, demoDarkTheme } from './theme/demoTheme';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import ErrorProvider from './providers/ErrorProvider';
import Notifications from './containers/Notifications';
import MeetingProviderWrapper from './containers/MeetingProviderWrapper';
import meetingConfig from './meetingConfig';

const App: FC = () => (
  <Router>
    <LoggerProvider logger={meetingConfig.logger}>
      <AppStateProvider>
        <VoiceFocusWrapper>
          <Theme>
            <NotificationProvider>
              <Notifications />
              <ErrorProvider>
                <MeetingProviderWrapper />
              </ErrorProvider>
            </NotificationProvider>
          </Theme>
        </VoiceFocusWrapper>
      </AppStateProvider>
    </LoggerProvider>
  </Router>
);

const VoiceFocusWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { joinInfo } = useAppState();

  function voiceFocusName(name: string): VoiceFocusModelName {
    if (name && ['default', 'ns_es'].includes(name)) {
      return name as VoiceFocusModelName;
    }
    return 'default';
  }

  function getVoiceFocusSpecName(): VoiceFocusModelName {
    if (joinInfo && joinInfo.Meeting?.MeetingFeatures?.Audio?.EchoReduction === 'AVAILABLE') {
      return voiceFocusName('ns_es');
    }
    return voiceFocusName('default');
  }

  const vfConfigValue = {
    spec: { name: getVoiceFocusSpecName() },
    createMeetingResponse: joinInfo,
  };

  return (
    <VoiceFocusProvider {...vfConfigValue}>
      {children}
    </VoiceFocusProvider>
  );
};

const Theme: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === 'light' ? demoLightTheme : demoDarkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default App;
