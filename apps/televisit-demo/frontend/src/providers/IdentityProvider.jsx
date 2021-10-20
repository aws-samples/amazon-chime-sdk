/* eslint-disable import/no-extraneous-dependencies */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useContext, useState, createContext, useEffect } from "react";

import appConfig from "../Config";
import { IdentityService } from "../services/IdentityService";
import { useAuthContext } from "./AuthProvider";
=======
import React, { useContext, useState, createContext, useEffect } from 'react';

import appConfig from '../Config';
import { IdentityService } from '../services/IdentityService';
import { useAuthContext } from './AuthProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const IdentityServiceContext = createContext(null);

export const IdentityProvider = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [identityService] = useState(
    () => new IdentityService(appConfig.region, appConfig.cognitoUserPoolId)
  );

  useEffect(() => {
    if (!identityService || !isAuthenticated) return;
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
<<<<<<< HEAD
      "useIdentityService must be used within a IdentityServiceContext"
=======
      'useIdentityService must be used within a IdentityServiceContext'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );
  }

  return context;
}

export default IdentityProvider;
