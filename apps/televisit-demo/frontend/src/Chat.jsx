/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "styled-components";
=======
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  MeetingProvider,
  lightTheme,
  NotificationProvider,
  darkTheme,
  GlobalStyles,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";
import routes from "./constants/routes";
import Notifications from "./containers/Notifications";
import "./Chat.css";
import { AppStateProvider, useAppState } from "./providers/AppStateProvider";
import { AuthProvider } from "./providers/AuthProvider";
import Signin from "./views/Signin";
import Channels from "./views/Channels";
import Meeting from "./views/Meeting";
import DeviceSetup from "./views/DeviceSetup";
import { MessagingProvider } from "./providers/ChatMessagesProvider";
import { UserPermissionProvider } from "./providers/UserPermissionProvider";
import { NavigationProvider } from "./providers/NavigationProvider";
import Authenticated from "./components/Authenticated";
import { IdentityProvider } from "./providers/IdentityProvider";
import NoMeetingRedirect from "./containers/NoMeetingRedirect";
=======
} from 'amazon-chime-sdk-component-library-react';
import routes from './constants/routes';
import Notifications from './containers/Notifications';
import './Chat.css';
import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import { AuthProvider } from './providers/AuthProvider';
import Signin from './views/Signin';
import Channels from './views/Channels';
import Meeting from './views/Meeting';
import DeviceSetup from './views/DeviceSetup';
import { MessagingProvider } from './providers/ChatMessagesProvider';
import { UserPermissionProvider } from './providers/UserPermissionProvider';
import { NavigationProvider } from './providers/NavigationProvider';
import Authenticated from './components/Authenticated';
import { IdentityProvider } from './providers/IdentityProvider';
import NoMeetingRedirect from './containers/NoMeetingRedirect';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const Chat = () => (
  <Router>
    <AppStateProvider>
      <Theme>
        <NotificationProvider>
          <Notifications />
          <MeetingProvider>
            <AuthProvider>
              <Authenticated />
<<<<<<< HEAD
              <IdentityProvider>
                <NavigationProvider>
                  <MessagingProvider>
                    <UserPermissionProvider>
                      <Switch>
                        <Route exact path={routes.SIGNIN} component={Signin} />
                        <Route path={routes.DEVICE}>
                          <NoMeetingRedirect>
                            <DeviceSetup />
                          </NoMeetingRedirect>
                        </Route>
                        <Route path={routes.MEETING}>
                          <NoMeetingRedirect>
                            <Meeting />
                          </NoMeetingRedirect>
                        </Route>
                        <Route path={routes.CHAT}>
                          <Channels />
                        </Route>
                      </Switch>
                    </UserPermissionProvider>
                  </MessagingProvider>
                </NavigationProvider>
              </IdentityProvider>
            </AuthProvider>
          </MeetingProvider>
=======
                <IdentityProvider>
                  <NavigationProvider>
                    <MessagingProvider>
                      <UserPermissionProvider>
                        <Switch>
                          <Route exact path={routes.SIGNIN} component={Signin} />
                          <Route path={routes.DEVICE}>
                            <NoMeetingRedirect>
                              <DeviceSetup />
                            </NoMeetingRedirect>
                          </Route>
                          <Route path={routes.MEETING}>
                            <NoMeetingRedirect>
                              <Meeting />
                            </NoMeetingRedirect>
                          </Route>
                          <Route path={routes.CHAT}>
                            <Channels />
                          </Route>
                        </Switch>
                      </UserPermissionProvider>
                    </MessagingProvider>
                  </NavigationProvider>
                </IdentityProvider>
              </AuthProvider>
            </MeetingProvider>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        </NotificationProvider>
      </Theme>
    </AppStateProvider>
  </Router>
);

const Theme = ({ children }) => {
  const { theme } = useAppState();

  return (
<<<<<<< HEAD
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
=======
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default Chat;
