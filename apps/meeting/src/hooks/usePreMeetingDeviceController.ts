// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';
import { useLogger } from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';
import { useAppState } from '../providers/AppStateProvider';

/**
 * Returns the persistent device controller for the opt-in pre-meeting device setup, or `undefined`
 * when that flow is off.
 *
 * MeetingProvider enumerates devices, and may prompt for permission, as soon as it receives a
 * controller. The controller is therefore created when the device-setup page is reached rather than
 * when the opt-in is checked, and kept after that, including after leaving the meeting, so device
 * selections persist across rejoin. Turning the opt-in off destroys it.
 */
const usePreMeetingDeviceController = (): DefaultDeviceController | undefined => {
  const logger = useLogger();
  const { pathname } = useLocation();
  const { isPreMeetingDeviceSetupAllowed, isVoiceFocusDesired } = useAppState();
  const [hasReachedDeviceSetup, setHasReachedDeviceSetup] = useState(false);

  const isActive = isPreMeetingDeviceSetupAllowed && (hasReachedDeviceSetup || pathname === routes.DEVICE);
  // Updated during render rather than in an effect, so the setup page mounts once, under a
  // MeetingProvider that already has the controller.
  if (isActive !== hasReachedDeviceSetup) {
    setHasReachedDeviceSetup(isActive);
  }

  // Web Audio is fixed at construction, so derive it from the Voice Focus choice.
  const deviceController = useMemo(
    () => (isActive ? new DefaultDeviceController(logger, { enableWebAudio: isVoiceFocusDesired }) : undefined),
    [isActive, isVoiceFocusDesired, logger]
  );

  useEffect(() => {
    return () => {
      void deviceController?.destroy();
    };
  }, [deviceController]);

  return deviceController;
};

export default usePreMeetingDeviceController;
