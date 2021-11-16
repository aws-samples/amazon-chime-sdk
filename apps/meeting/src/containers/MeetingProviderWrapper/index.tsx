// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  BackgroundBlurProvider,
  MeetingProvider,
  VoiceFocusProvider,
} from 'amazon-chime-sdk-component-library-react';

import routes from '../../constants/routes';
import { BlurValues } from '../../constants';
import { NavigationProvider } from '../../providers/NavigationProvider';
import NoMeetingRedirect from '../NoMeetingRedirect';
import { Meeting, Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';
import meetingConfig from '../../meetingConfig';
import { useAppState } from '../../providers/AppStateProvider';

const MeetingProviderWrapper: React.FC = () => {
  const { isWebAudioEnabled, blurOption } = useAppState();
  const isBackgroundBlurEnabled = blurOption !== BlurValues.blurDisabled;

  const meetingConfigValue = {
    ...meetingConfig,
    enableWebAudio: isWebAudioEnabled,
  };

  const getMeetingProviderWrapper = () => {
    return (
      <MeetingProvider {...meetingConfigValue}>
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
      </MeetingProvider>
    );
  };

  const getMeetingProviderWrapperWithVF = (children: React.ReactNode) => {
    return (
      <VoiceFocusProvider>
        {children}
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

  const getMeetingProviderWithFeatures = () : React.ReactNode => {
    let children = getMeetingProviderWrapper();
    if (isWebAudioEnabled) {
      children = getMeetingProviderWrapperWithVF(children);
    }
    if (isBackgroundBlurEnabled) {
      children = getMeetingProviderWrapperWithBGBlur(children);
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
