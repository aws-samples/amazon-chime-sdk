// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AudioInputDevice, DefaultDeviceController, VoiceFocusTransformDevice } from 'amazon-chime-sdk-js';
import {
  MeetingProvider,
  useLogger,
  useVoiceFocus,
} from 'amazon-chime-sdk-component-library-react';
import { useAppState } from '../../providers/AppStateProvider';

import routes from '../../constants/routes';
import { NavigationProvider } from '../../providers/NavigationProvider';
import NoMeetingRedirect from '../NoMeetingRedirect';
import { Meeting, Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';

const MeetingProviderWithDeviceReplacement: React.FC<PropsWithChildren> = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();
  const { enableMaxContentShares, isPreMeetingDeviceSetupAllowed, hasEnteredDeviceSetup, isVoiceFocusDesired } =
    useAppState();
  const logger = useLogger();

  const onDeviceReplacement = (nextDevice: string, currentDevice: AudioInputDevice) => {
    if (currentDevice instanceof VoiceFocusTransformDevice) {
      return addVoiceFocus(nextDevice);
    }
    return Promise.resolve(nextDevice);
  };

  // Opt-in pre-meeting device setup: build one persistent DeviceController so the device
  // selection survives leave/rejoin. It is created only after the device-setup page is reached,
  // because MeetingProvider enumerates devices (and may prompt) as soon as it has a controller.
  // Web Audio is fixed at construction, so derive it from the Voice Focus choice.
  const isPersistentControllerActive = isPreMeetingDeviceSetupAllowed && hasEnteredDeviceSetup;
  const deviceController = useMemo(
    () =>
      isPersistentControllerActive
        ? new DefaultDeviceController(logger, {
            enableWebAudio: isVoiceFocusDesired,
          })
        : undefined,
    [isPersistentControllerActive, isVoiceFocusDesired, logger]
  );

  useEffect(() => {
    return () => {
      void deviceController?.destroy();
    };
  }, [deviceController]);

  // MeetingProvider captures the deviceController once at mount, so remount whenever the controller
  // is created/destroyed or rebuilt because Voice Focus flipped Web Audio (fixed at construction).
  const meetingProviderKey = `persistent-${isPersistentControllerActive}-webaudio-${isVoiceFocusDesired}`;

  const meetingConfigValue = {
    onDeviceReplacement: onDeviceReplacement as any,
    ...(enableMaxContentShares ? { maxContentShares: 2 } : {}),
    ...(deviceController ? { deviceController } : {}),
  };

  return (
    <MeetingProvider key={meetingProviderKey} {...meetingConfigValue}>
      {children}
    </MeetingProvider>
  );
};

const MeetingProviderWrapper: React.FC = () => {
  const getMeetingProviderWrapper = () => {
    return (
      <>
        <NavigationProvider>
          <Routes>
            <Route path={routes.HOME} element={<Home />} />
            <Route
              path={routes.DEVICE}
              element={
                <NoMeetingRedirect>
                  <DeviceSetup />
                </NoMeetingRedirect>
              }
            ></Route>
            <Route
              path={`${routes.MEETING}/:meetingId`}
              element={
                <NoMeetingRedirect>
                  <MeetingModeSelector />
                </NoMeetingRedirect>
              }
            ></Route>
          </Routes>
        </NavigationProvider>
        <MeetingEventObserver />
      </>
    );
  };

  return (
    <MeetingProviderWithDeviceReplacement>
      {getMeetingProviderWrapper()}
    </MeetingProviderWithDeviceReplacement>
  );
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default MeetingProviderWrapper;
