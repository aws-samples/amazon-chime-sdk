// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
<<<<<<< HEAD
  Dots,
} from "amazon-chime-sdk-component-library-react";

import EndMeetingControl from "../EndMeetingControl";
import { useNavigation } from "../../providers/NavigationProvider";
import { StyledControls } from "./Styled";

const MeetingControls = () => {
  const { toggleNavbar, closeRoster, showRoster, closeChat, showChat } =
    useNavigation();
=======
  Dots
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';

const MeetingControls = () => {
  const { toggleNavbar, closeRoster, showRoster, closeChat, showChat } = useNavigation();
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const { isUserActive } = useUserActivityState();

  const handleToggle = () => {
    if (showRoster) {
      closeRoster();
    }

    if (showChat) {
      closeChat();
    }

    toggleNavbar();
  };

  return (
    <StyledControls className="controls" active={!!isUserActive}>
      <ControlBar
        className="controls-menu"
        layout="undocked-horizontal"
        showLabels
      >
        <ControlBarButton
          className="mobile-toggle"
          icon={<Dots />}
          onClick={handleToggle}
          label="Menu"
        />
        <AudioInputControl />
        <VideoInputControl />
        <ContentShareControl />
        <AudioOutputControl />
        <EndMeetingControl />
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
