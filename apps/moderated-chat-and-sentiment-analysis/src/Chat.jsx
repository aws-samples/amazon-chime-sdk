/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  lightTheme,
  NotificationProvider,
  GlobalStyles,
} from 'amazon-chime-sdk-component-library-react';
import routes from './constants/routes';
import Notifications from './components/Notifications';
import './Chat.css';
import { AuthProvider } from './providers/AuthProvider';
import JoinChannel from './views/JoinChannel';
import Channel from './views/Channel';
import { MessagingProvider } from './providers/ChatMessagesProvider';
import Authenticated from './components/Authenticated';

const Chat = () => (
  <Router>
    <Theme>
      <NotificationProvider>
        <Notifications />
        <AuthProvider>
          <Authenticated />
          <Switch>
            <Route path={routes.CHAT}>
              <MessagingProvider>
                <Channel />
              </MessagingProvider>
            </Route>
            <Route exact path={routes.JOIN} component={JoinChannel} />
          </Switch>
        </AuthProvider>
      </NotificationProvider>
    </Theme>
  </Router>
);

const Theme = ({ children }) => (
  <ThemeProvider theme={lightTheme}>
    <GlobalStyles />
    {children}
  </ThemeProvider>
);

export default Chat;
