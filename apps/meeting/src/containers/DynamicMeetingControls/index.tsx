// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots,
  useDeviceLabelTriggerStatus,
  DeviceLabelTriggerStatus,
  DeviceLabels,
  AudioInputVFControl,
} from 'amazon-chime-sdk-component-library-react';

import EndMeetingControl from '../EndMeetingControl';
import { useNavigation } from '../../providers/NavigationProvider';
import { StyledControls } from './Styled';
import DevicePermissionControl from '../DevicePermissionControl/DevicePermissionControl';
import { useAppState } from '../../providers/AppStateProvider';
import VideoInputTransformControl from '../../components/MeetingControls/VideoInputTransformControl';
import { VideoFiltersCpuUtilization } from '../../types';

const DynamicMeetingControls = () => {
  const { toggleNavbar, closeRoster, showRoster } = useNavigation();
  const { isUserActive } = useUserActivityState();
  const status = useDeviceLabelTriggerStatus();
  const { isVoiceFocusEnabled, videoTransformCpuUtilization } = useAppState();
  const videoTransformsEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;

  const handleToggle = () => {
    if (showRoster) {
      closeRoster();
    }

    toggleNavbar();
  };

  return (
    <StyledControls className="controls" $active={!!isUserActive}>
      <ControlBar className="controls-menu" layout="undocked-horizontal" showLabels>
        <ControlBarButton className="mobile-toggle" icon={<Dots />} onClick={handleToggle} label="Menu" />
        {status === DeviceLabelTriggerStatus.GRANTED ? (
          <>
            {isVoiceFocusEnabled ? <AudioInputVFControl /> : <AudioInputControl />}
            {videoTransformsEnabled ? <VideoInputTransformControl /> : <VideoInputControl />}
            <ContentShareControl />
            <AudioOutputControl />
          </>
        ) : (
          <DevicePermissionControl deviceLabels={DeviceLabels.AudioAndVideo} />
        )}

        <EndMeetingControl />
      </ControlBar>
    </StyledControls>
  );
};

export default DynamicMeetingControls;
