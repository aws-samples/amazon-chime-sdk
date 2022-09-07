// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  ControlBar,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots,
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';
import CustomAudioInputControl from '../../components/SL/customControls/CustomAudioInputControl';
import CustomVideoInputControl from '../../components/SL/customControls/CustomVideoInputControl';
import CustomContentShareControl from '../../components/SL/customControls/CustomContentShareControl';

const MeetingControls: React.FC = () => {
  const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  const { isUserActive } = useUserActivityState();

  const handleToggle = (): void => {
    if (showRoster) {
      closeRoster();
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
        <CustomAudioInputControl /> 
        <CustomVideoInputControl/> 
        <CustomContentShareControl />
        <AudioOutputControl />
        <EndMeetingControl />
      </ControlBar>
    </StyledControls>
  );
};

export default MeetingControls;
