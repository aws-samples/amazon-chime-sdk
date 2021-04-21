/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { createContext, useContext, useState } from 'react';
import { useNotificationDispatch } from 'amazon-chime-sdk-component-library-react';
import appConfig from '../Config';
import { chimeClient } from '../api/ChimeAPI';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const notificationDispatch = useNotificationDispatch();
  // Member
  const [member, setMember] = useState({
    username: '',
    userId: '',
  });
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const leaveChat = async () => {
    try {
      setIsAuthenticated(false);
    } catch (error) {
      console.log(`error siging out ${error}`);
    }
  };

  const joinAnonymously = async (userName) => {
    console.log(`Creating user with userName ${userName}`);
    try {
      const response = await fetch(appConfig.createUserApiGatewayURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName,
          appInstanceArn: appConfig.appInstanceArn,
          channelArn: appConfig.channelArn,
          adminUserArn: appConfig.adminUserArn,
        }),
      });
      const respData = await response.json();
      await chimeClient.setupChimeClient(respData.ChimeCredentials);
      setMember({ username: userName, userId: respData.ChimeUserId });
      setIsAuthenticated(true);
    } catch (error) {
      console.error(`Error joining ${error}`);
      notificationDispatch({
        type: 0,
        payload: {
          message: 'Error joining',
          severity: 'error',
        },
      });
    }
  };

  const authFulfiller = {
    member,
    isAuthenticated,
    joinAnonymously,
    leaveChat,
  };

  return (
    <AuthContext.Provider value={authFulfiller}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
};

export { AuthProvider, useAuthContext };
