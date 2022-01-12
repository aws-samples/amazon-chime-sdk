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
  BackgroundReplacementProvider,
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
import { VideoFilters } from '../../types';

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
  const { isWebAudioEnabled, blurOption, videoTransformCpuUtilization, imageBlob } = useAppState();
  //const isBackgroundBlurEnabled = blurOption !== BlurValues.blurDisabled;
  const isFilterEnabled = videoTransformCpuUtilization !== VideoFilters.FilterDisabled;

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

  const getWrapperWithVideoFilter = (children: React.ReactNode) => {
    let filterCPUUtilization = parseInt(videoTransformCpuUtilization,10);
    if (!filterCPUUtilization) {
      filterCPUUtilization = 40;
    }
    console.log(`Using ${filterCPUUtilization} background blur and replacement`);
    return (
      <BackgroundBlurProvider options={{filterCPUUtilization}} >
        <BackgroundReplacementProvider options={{imageBlob, filterCPUUtilization}} >
          {children}
        </BackgroundReplacementProvider>
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

    if(isFilterEnabled){
      children = getWrapperWithVideoFilter(children);
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
      {imageBlob === undefined ? <div>Loading Assets</div> :getMeetingProviderWithFeatures()}
    </>
  );
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default MeetingProviderWrapper;
