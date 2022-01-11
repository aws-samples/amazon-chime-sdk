// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  AudioTransformDevice,
  Device,
  VoiceFocusModelName,
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
import { BlurValues } from '../../types';

const MeetingProviderWithDeviceReplacement: React.FC = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();

  const onDeviceReplacement = (
    nextDevice: string,
    currentDevice: Device | AudioTransformDevice
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

  return <MeetingProvider {...meetingConfigValue}>{children}</MeetingProvider>;
};

const MeetingProviderWrapper: React.FC = () => {
  const { isWebAudioEnabled, blurOption, joinInfo } = useAppState();
  const isBackgroundBlurEnabled = blurOption !== BlurValues.blurDisabled;

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

  function voiceFocusName(name: string): VoiceFocusModelName {
    if (name && ['default', 'ns_es'].includes(name)) {
      return name as VoiceFocusModelName;
    }
    return 'default';
  }

  function getVoiceFocusSpecName(): VoiceFocusModelName {
    if (
      joinInfo && 
      joinInfo.Meeting?.MeetingFeatures?.Audio?.EchoReduction === 'AVAILABLE'
    ) {
      return voiceFocusName('ns_es');
    }
    return voiceFocusName('default');
  }

  const vfConfigValue = {
    spec: {name: getVoiceFocusSpecName()},
    createMeetingResponse: joinInfo,
  };

  const getMeetingProviderWrapperWithVF = (children: React.ReactNode) => {
    return (
      <VoiceFocusProvider {...vfConfigValue}>
        <MeetingProviderWithDeviceReplacement>
          {children}
        </MeetingProviderWithDeviceReplacement>
      </VoiceFocusProvider>
    );
  };

  const getMeetingProviderWrapperWithBGBlur = (children: React.ReactNode) => {
    let filterCPUUtilization = parseInt(blurOption,10);
    if (!filterCPUUtilization) {
      filterCPUUtilization = 40;
    }
    console.log(`Using ${filterCPUUtilization} CPU utilization for background blur`);
    return (
      <BackgroundBlurProvider options={{filterCPUUtilization}} >
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
