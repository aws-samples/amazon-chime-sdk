// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useContext, useState } from "react";
const UserPermissionContext = React.createContext();

const UserPermissionProvider = ({ children }) => {
  const [role, setRole] = useState("user");
=======
import React, { useContext, useState } from 'react';
const UserPermissionContext = React.createContext();

const UserPermissionProvider = ({ children }) => {
  const [role, setRole] = useState('user');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const providerValue = {
    role,
    setRole,
  };

  return (
    <UserPermissionContext.Provider value={providerValue}>
      {children}
    </UserPermissionContext.Provider>
  );
};

const useUserPermission = () => {
  const context = useContext(UserPermissionContext);

  if (!context) {
    throw new Error(
<<<<<<< HEAD
      "useUserPermission must be used within UserPermissionProvider"
=======
      'useUserPermission must be used within UserPermissionProvider'
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );
  }

  return context;
};

export { UserPermissionProvider, useUserPermission };
