// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import {
  lightTheme,
  MeetingProvider,
  NotificationProvider,
  darkTheme,
  GlobalStyles,
  VoiceFocusProvider,
} from "amazon-chime-sdk-component-library-react";

import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
import ErrorProvider from "./providers/ErrorProvider";
import routes from "./constants/routes";
import { NavigationProvider } from "./providers/NavigationProvider";
import { Meeting, Home, DeviceSetup } from "./views";
import Notifications from "./containers/Notifications";
import NoMeetingRedirect from "./containers/NoMeetingRedirect";
import MeetingEventObserver from "./containers/MeetingEventObserver";
import meetingConfig from "./meetingConfig";

const App: FC = () => (
  <Router>
    <AppStateProvider>
      <Theme>
        <NotificationProvider>
          <Notifications />
          <ErrorProvider>
            <VoiceFocusProvider>
              <MeetingWrapper />
            </VoiceFocusProvider>
          </ErrorProvider>
        </NotificationProvider>
      </Theme>
    </AppStateProvider>
  </Router>
);

const MeetingWrapper: React.FC = ({ children }) => {

  const  { isWebAudioEnabled } =  useAppState();

  const meetingConfigValue = {...meetingConfig,
    enableWebAudio: isWebAudioEnabled
  };

  return (
    <MeetingProvider {...meetingConfigValue}>
      <NavigationProvider>
        <Switch>
          <Route exact path={routes.HOME} component={Home} />
          <Route path={routes.DEVICE}>
            <NoMeetingRedirect>
              <DeviceSetup />
            </NoMeetingRedirect>
          </Route>
          <Route path={routes.MEETING}>
            <NoMeetingRedirect>
              <MeetingModeSelector />
            </NoMeetingRedirect>
          </Route>
        </Switch>
      </NavigationProvider>
      <MeetingEventObserver />
    </MeetingProvider>
  );
};

const Theme: React.FC = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default App;
