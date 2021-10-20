// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  Flex,
  Heading,
  PrimaryButton,
<<<<<<< HEAD
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";

import { useAppState } from "../../providers/AppStateProvider";
import { StyledList } from "./Styled";
=======
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';

import { useAppState } from '../../providers/AppStateProvider';
import { StyledList } from './Styled';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MeetingDetails = () => {
  const { meetingId, toggleTheme, theme } = useAppState();
  const manager = useMeetingManager();

  return (
    <Flex container layout="fill-space-centered">
      <Flex>
        <Heading level={4} tag="h1">
          Meeting information
        </Heading>
        <StyledList>
          <div>
            <dt>Meeting ID</dt>
            <dd>{meetingId}</dd>
          </div>
          <div>
            <dt>Hosted region</dt>
            <dd>{manager.meetingRegion}</dd>
          </div>
        </StyledList>
        <PrimaryButton
<<<<<<< HEAD
          label={theme === "light" ? "Dark mode" : "Light mode"}
=======
          label={theme === 'light' ? 'Dark mode' : 'Light mode'}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          onClick={toggleTheme}
        ></PrimaryButton>
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
