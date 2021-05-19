// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import {
  FormField,
  Input,
  Button,
  Heading,
} from 'amazon-chime-sdk-component-library-react';

import './LoginWithCognito.css';

const LoginWithCognito = (props) => {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = props;

  const onRegister = (e) => {
    e.preventDefault();
    register(userName, password, '');
  };

  const onLogin = (e) => {
    e.preventDefault();
    login(userName, password);
  };

  const onUserName = (e) => {
    setUsername(e.target.value);
  };

  const onPassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div>
      <Heading
        css="font-size: 0.875rem !important; line-height: 3rem !important;"
        level="2"
      >
        Enter your information and select Sign in or Register
      </Heading>
      <form onSubmit={onLogin} className="signin-form">
        <div className="input-container">
          <FormField
            field={Input}
            label="User name"
            className="input username-input"
            onChange={(e) => onUserName(e)}
            value={userName}
            type="text"
            showClear
            layout="horizontal"
          />
          <FormField
            field={Input}
            label="Password"
            fieldProps={{ type: 'password' }}
            className="input password-input"
            onChange={(e) => onPassword(e)}
            value={password}
            showClear
            layout="horizontal"
            infoText="Minimum 8 characters, at least 1 uppercase, 1 number, 1 special character"
          />
        </div>
        <div className="signin-buttons">
          <Button onClick={onLogin} label="Sign in" variant="primary" />
          <span className="or-span">or</span>
          <Button onClick={onRegister} label="Register" variant="secondary" />
        </div>
      </form>
    </div>
  );
};

export default LoginWithCognito;
