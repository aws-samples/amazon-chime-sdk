// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import MeetingRoster from '../MeetingRoster';
import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import Chat from '../Chat';
import { Flex } from 'amazon-chime-sdk-component-library-react';

const NavigationControl = () => {
  const { showNavbar, showRoster, showChat } = useNavigation();

  const view = () => {
    if (showRoster && showChat) {
      return (
        <Flex layout='stack'>
          <MeetingRoster />
          <Chat />
        </Flex>
      );
    }
    if (showRoster) {
      return <MeetingRoster />;
    }
    if (showChat) {
      return <Chat />;
    }
    return null;
  };

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {view()}
    </>
  );
};

export default NavigationControl;
