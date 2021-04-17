/* eslint-disable import/no-unresolved */
// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import {
  Heading,
  Grid,
  Cell,
  Flex,
  FormField,
  Input,
  Button,
} from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';
import { useAuthContext } from '../../providers/AuthProvider';
import './style.css';

const JoinChannel = () => {
  const { joinAnonymously } = useAuthContext();
  const currentTheme = useTheme();
  const [userName, setUsername] = useState('');

  const onJoin = async (e) => {
    e.preventDefault();
    await joinAnonymously(userName);
  };

  const onUserName = (e) => {
    setUsername(e.target.value);
  };

  return (
    <Grid
      gridTemplateRows="3rem 100%"
      gridTemplateAreas='
      "heading"
      "main"
      '
    >
      <Cell gridArea="heading">
        <Heading
          level={1}
          style={{
            backgroundColor: currentTheme.colors.greys.grey60,
            height: '3rem',
          }}
          className="app-heading"
        >
          Chat App
        </Heading>
      </Cell>
      <Cell gridArea="main">
        <Flex className="join-container" layout="stack">
          <Heading css="font-size: 1.1875rem; line-height: 4rem;" level="1">
            Join chat
          </Heading>
          <Heading css="font-size: 0.875rem; line-height: 3rem;" level="2">
            Enter your username and select Join
          </Heading>
          <form onSubmit={onJoin} className="join-form">
            <div className="input-container">
              <FormField
                field={Input}
                label="Name"
                className="input username-input"
                onChange={(e) => onUserName(e)}
                value={userName}
                type="text"
                showClear
                layout="horizontal"
              />
            </div>
            <div className="join-buttons">
              <Button onClick={onJoin} label="Join" variant="primary" />
            </div>
          </form>
        </Flex>
      </Cell>
    </Grid>
  );
};

export default JoinChannel;
