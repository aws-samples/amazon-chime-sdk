/* eslint-disable import/no-extraneous-dependencies */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useState, createContext, useEffect } from 'react';

import appConfig from '../Config';
import { IdentityService } from '../services/IdentityService';
import { useAuthContext } from './AuthProvider';

const IdentityServiceContext = createContext(null);

export const IdentityProvider = ({ children }) => {
  const { isAuthenticated, useCognitoIdp} = useAuthContext();
  const [identityService] = useState(
      useCognitoIdp ? () => new IdentityService(appConfig.region, appConfig.cognitoUserPoolId) : null
  );

  useEffect(() => {
    if (!identityService || !isAuthenticated || !useCognitoIdp) return;
    identityService.setupClient();
  }, [identityService, isAuthenticated]);

  return (
    <IdentityServiceContext.Provider value={identityService}>
      {children}
    </IdentityServiceContext.Provider>
  );
};

export function useIdentityService() {
  const context = useContext(IdentityServiceContext);

  if (context === undefined) {
    throw new Error(
      'useIdentityService must be used within a IdentityServiceContext'
    );
  }

  return context;
}

export default IdentityProvider;
