// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  AudioTransformDevice,
  Device,
  VoiceFocusTransformDevice,
} from 'amazon-chime-sdk-js';
import {
  BackgroundBlurProvider,
  MeetingProvider,
  useVoiceFocus,
  VoiceFocusProvider,
} from 'amazon-chime-sdk-component-library-react';

import routes from '../../constants/routes';
import { NavigationProvider } from '../../providers/NavigationProvider';
import NoMeetingRedirect from '../NoMeetingRedirect';
import { Meeting, Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';
import meetingConfig from '../../meetingConfig';
import { useAppState } from '../../providers/AppStateProvider';

const MeetingProviderWithDeviceReplacement: React.FC = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();

  const onDeviceReplacement = (
    nextDevice: string,
    currentDevice: Device | AudioTransformDevice,
  ): Promise<Device | VoiceFocusTransformDevice> => {
    if (currentDevice instanceof VoiceFocusTransformDevice) {
      return addVoiceFocus(nextDevice);
    }
    return Promise.resolve(nextDevice);
  };

  const meetingConfigValue = {
    ...meetingConfig,
    enableWebAudio: true,
    onDeviceReplacement,
  };

  return <MeetingProvider {...meetingConfigValue}>{children}</MeetingProvider>
};

const MeetingProviderWrapper: React.FC = () => {
  const { isWebAudioEnabled, isBackgroundBlurEnabled } = useAppState();

  const meetingConfigValue = {
    ...meetingConfig,
    enableWebAudio: isWebAudioEnabled,
  };

  const getMeetingProviderWrapper = () => {
    return (
      <>
        <NavigationProvider>
          <Switch>
            <Route exact path={routes.HOME} component={Home} />
            <Route path={routes.DEVICE}>
              <NoMeetingRedirect>
                <DeviceSetup />
              </NoMeetingRedirect>
            </Route>
            <Route path={routes.MEETING}>
              <NoMeetingRedirect>
                <MeetingModeSelector />
              </NoMeetingRedirect>
            </Route>
          </Switch>
        </NavigationProvider>
        <MeetingEventObserver />
      </>
    );
  };

  const getMeetingProviderWrapperWithVF = (children: React.ReactNode) => {
    return (
      <VoiceFocusProvider>
        <MeetingProviderWithDeviceReplacement>
          {children}
        </MeetingProviderWithDeviceReplacement>
      </VoiceFocusProvider>
    );
  };

  const getMeetingProviderWrapperWithBGBlur = (children: React.ReactNode) => {
    return (
      <BackgroundBlurProvider>
        {children}
      </BackgroundBlurProvider>
    );
  };

  const getMeetingProvider = (children: React.ReactNode) => {
    return (
      <MeetingProvider {...meetingConfigValue}>
        {children}
      </MeetingProvider>
    );
  };

  const getMeetingProviderWithFeatures = (): React.ReactNode => {
    let children = getMeetingProviderWrapper();

    if (isBackgroundBlurEnabled) {
      children = getMeetingProviderWrapperWithBGBlur(children);
    }
    if (isWebAudioEnabled) {
      children = getMeetingProviderWrapperWithVF(children);
    } else {
      children = getMeetingProvider(children);
    }
    return children;
  };

  return (
    <>
      {getMeetingProviderWithFeatures()}
    </>
  );
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default MeetingProviderWrapper;
