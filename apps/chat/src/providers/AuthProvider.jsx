/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from '@aws-amplify/auth';
import { useNotificationDispatch } from 'amazon-chime-sdk-component-library-react';
import appConfig from '../Config';
import AWS from 'aws-sdk';

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
  // isAnonymous (anon does not have access to write to S3 for attachments) default to cognito flow
  const [isAnonymous, setAnonymous] = useState(false);
  // Using CognitoIdp (if true use Cognito IDP to search for users when adding members to a room,
  // else lookup using ListAppInstanceUsers API), default to Cognito flow
  const [useCognitoIdp, setUseCognitoIdp] = useState(true);


  const userSignOut = async () => {
    try {
      await Auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.log(`error signing out ${error}`);
    }
  };

  const userSignUp = async (username, password) => {
    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          // TODO: Utilize input field for email that way we can then have users self confirm after reg.
          email: 'email@me.com',
          profile: 'none',
        },
      });
      notificationDispatch({
        type: 0,
        payload: {
          message:
            'Your registration information has been set to your administrator. Contact them for additional instructions.',
          severity: 'success',
        },
      });
    } catch (error) {
      console.log('error signing up:', error);
      notificationDispatch({
        type: 0,
        payload: {
          message: 'Registration failed.',
          severity: 'error',
        },
      });
    }
  };

  const updateUserAttributes = async (userId) => {
    try {
      const user = await Auth.currentAuthenticatedUser();

      await Auth.updateUserAttributes(user, {
        profile: userId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getAwsCredentialsFromCognito = async () => {
    const creds = await Auth.currentCredentials();
    const essentialCreds = await Auth.essentialCredentials(creds);
    AWS.config.region = appConfig.region;
    AWS.config.credentials = essentialCreds;
    return essentialCreds;
  };

  const setAuthenticatedUserFromCognito = () => {
    setUseCognitoIdp(true);
    Auth.currentUserInfo()
        .then(curUser => {
          setMember({ username: curUser.username, userId: curUser.id });
          if (curUser.attributes?.profile === 'none') {
            updateUserAttributes(curUser.id);
            // Once we set attribute let's have user relogin to refresh SigninHookFn trigger.
            setIsAuthenticated(false);

            notificationDispatch({
              type: 0,
              payload: {
                message:
                    'Your account is activated! Please sign in again to confirm.',
                severity: 'success',
              },
            });
          } else {
            setAnonymous(false);
            setIsAuthenticated(true);
          }
        })
        .catch((err) => {
          console.log(`Failed to set authenticated user! ${err}`);
        });
    getAwsCredentialsFromCognito();
  };

  const userSignIn = (username, password) => {
    Auth.signIn({ username, password })
        .then(setAuthenticatedUserFromCognito)
        .catch((err) => {
          console.log(err);
          notificationDispatch({
            type: 0,
            payload: {
              message: 'Your username and/or password is invalid!',
              severity: 'error',
            },
          });
        });
  };


  const setAuthenticatedUserFromCredentialExchangeService = (response) => {
    setUseCognitoIdp(false);
    setAnonymous(true)
    setMember({
      username: response.ChimeDisplayName,
      userId: response.ChimeUserId
    });
    const stsCredentials = response.ChimeCredentials;
    updateUserAttributes(response.ChimeUserId);
    AWS.config.region = appConfig.region;
    AWS.config.credentials = {
      accessKeyId: stsCredentials.AccessKeyId,
      secretAccessKey: stsCredentials.SecretAccessKey,
      sessionToken: stsCredentials.SessionToken
    };

    setIsAuthenticated(true);
  };

  // Credential Exchange Service Code.  Set Access Token on Authorization header using Bearer type.
  const userExchangeTokenForAwsCreds = accessToken => {
    fetch(`${appConfig.apiGatewayInvokeUrl}creds`, {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({
        Authorization: `Bearer ${btoa(accessToken)}`
      })
    }).then(response => response.json())
        .then(data => setAuthenticatedUserFromCredentialExchangeService(data))
        .catch(err => {
          console.log(err);
          notificationDispatch({
            type: 0,
            payload: {
              message: 'Your username and/or password is invalid!',
              severity: 'error',
            },
          });
        });
  };

  useEffect(() => {
    Auth.currentAuthenticatedUser()
        .then(setAuthenticatedUserFromCognito)
        .catch((err) => {
          console.log(err);
          setIsAuthenticated(false);
        });
  }, [Auth]);

  const authFulfiller = {
    member,
    isAuthenticated,
    isAnonymous,
    useCognitoIdp,
    userSignOut,
    userSignUp,
    userSignIn,
    userExchangeTokenForAwsCreds: userExchangeTokenForAwsCreds
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
