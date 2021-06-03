// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import {
  Textarea,
  Input,
  Button,
  Heading,
} from 'amazon-chime-sdk-component-library-react';

import './LoginWithCredentialExchangeService.css';

const LoginWithCredentialExchangeService = (props) => {
  const { exchangeCreds } = props;

  const [accessToken, setAccessToken] = useState(
    "{\n  defaultsTo: 'anonymousAccess',\n}\n"
  );

  const onAccessToken = (e) => {
    setAccessToken(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    exchangeCreds(accessToken);
  };

  return (
    <div>
      <Heading
        css="font-size: 0.875rem !important; line-height: 3rem !important;"
        level="2"
      >
        Enter your Identity Token (JWT, PASETO, custom, etc):
      </Heading>
      <form onSubmit={onSubmit} className="signin-form">
        <div className="input-container">
          <Textarea
            field={Input}
            label="AccessToken"
            className="input access-token-input"
            onChange={(e) => onAccessToken(e)}
            value={accessToken}
            layout="horizontal"
          />
        </div>
        <br />
        <div className="access-token-submit-button">
          <Button onClick={onSubmit} label="Exchange Token for AWS Credentials" variant="primary" />
        </div>
      </form>
    </div>
  );
};

export default LoginWithCredentialExchangeService;
