/* eslint-disable import/no-unresolved */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import { Heading, Grid, Cell } from "amazon-chime-sdk-component-library-react";
import { useTheme } from "styled-components";
import Login from "../../containers/login/Login";
import { useAuthContext } from "../../providers/AuthProvider";
=======
import React from 'react';
import { Heading, Grid, Cell } from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';
import Login from '../../containers/login/Login';
import { useAuthContext } from '../../providers/AuthProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const Signin = () => {
  const { userSignIn, userSignUp } = useAuthContext();
  const currentTheme = useTheme();

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
<<<<<<< HEAD
            height: "3rem",
=======
            height: '3rem',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          }}
          className="app-heading"
        >
          AWS TeleHealth Demo
        </Heading>
      </Cell>
      <Cell gridArea="main">
        <Login register={userSignUp} login={userSignIn} />
      </Cell>
    </Grid>
  );
};

export default Signin;
