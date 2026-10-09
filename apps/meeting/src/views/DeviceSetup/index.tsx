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
  const { isPreMeetingDeviceSetupAllowed, hasEnteredDeviceSetup, setHasEnteredDeviceSetup } = useAppState();

  useEffect(() => {
    if (!isPreMeetingDeviceSetupAllowed) {
      return;
    }
    // The device controller is created only once this page is reached, so the home form never
    // prompts for permission. Setting the flag remounts MeetingProvider with the controller.
    if (!hasEnteredDeviceSetup) {
      setHasEnteredDeviceSetup(true);
      return;
    }
    // Enumerate, prompt for permission, and start default devices so the pickers populate before joining.
    meetingManager.invokeDeviceProvider(DeviceLabels.AudioAndVideo);
    meetingManager.listAndSelectDevices(DeviceLabels.AudioAndVideo);
  }, [meetingManager, isPreMeetingDeviceSetupAllowed, hasEnteredDeviceSetup]);

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
