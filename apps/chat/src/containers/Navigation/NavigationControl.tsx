// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import MeetingRoster from '../MeetingRoster';
import MeetingChat from '../MeetingChat';
import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';

const NavigationControl = () => {
  const { showNavbar, showRoster, showChat } = useNavigation();

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {showChat ? <MeetingChat /> : null}
      {showRoster ? <MeetingRoster /> : null}
    </>
  );
};

export default NavigationControl;
