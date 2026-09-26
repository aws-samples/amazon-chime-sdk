// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react';
import { DeviceLabels, Heading, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import MeetingJoinDetails from '../../containers/MeetingJoinDetails';
import { StyledLayout } from './Styled';
import DeviceSelection from '../../components/DeviceSelection';
import { useAppState } from '../../providers/AppStateProvider';

const DeviceSetup: React.FC = () => {
  const meetingManager = useMeetingManager();
  const { isPreMeetingDeviceSetupAllowed } = useAppState();

  // Enumerate, prompt for permission, and start default devices so the pickers populate before joining.
  useEffect(() => {
    if (isPreMeetingDeviceSetupAllowed) {
      meetingManager.invokeDeviceProvider(DeviceLabels.AudioAndVideo);
      meetingManager.listAndSelectDevices(DeviceLabels.AudioAndVideo);
    }
  }, [meetingManager, isPreMeetingDeviceSetupAllowed]);

  return (
    <StyledLayout>
      <Heading tag="h1" level={3} css="align-self: flex-start">
        Device settings
      </Heading>
      <DeviceSelection />
      <MeetingJoinDetails />
    </StyledLayout>
  );
};

export default DeviceSetup;
