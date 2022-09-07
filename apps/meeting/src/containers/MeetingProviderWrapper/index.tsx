// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  AudioInputDevice,
  Device,
  VoiceFocusModelName,
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
import { Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';
import { useAppState } from '../../providers/AppStateProvider';
import { VideoFiltersCpuUtilization } from '../../types';
import UserModeSelector from '../UserModeSelectorWrapper/index';
import BaseMeetingCreteFormWrapper from '../BaseMeetingCreteFormWrapper';
import ErrorPage from '../../components/SL/ErrorPage';
import Lobby from '../../components/SL/lobby';
import { PluginProvider } from '../../providers/PluginProvider';

const MeetingProviderWithDeviceReplacement: React.FC = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();

  const onDeviceReplacement = (
    nextDevice: string,
    currentDevice: AudioInputDevice
  ): Promise<Device | VoiceFocusTransformDevice> => {
    if (currentDevice instanceof VoiceFocusTransformDevice) {
      return addVoiceFocus(nextDevice);
    }
    return Promise.resolve(nextDevice);
  };

  const meetingConfigValue = {
    onDeviceReplacement,
  };

  return <MeetingProvider {...meetingConfigValue}>{children}</MeetingProvider>;
};

const MeetingProviderWrapper: React.FC = () => {

  const { isWebAudioEnabled, videoTransformCpuUtilization, imageBlob, joinInfo } = useAppState();

  const isFilterEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;

  const getMeetingProviderWrapper = () => {
    return (
      <>
        <NavigationProvider>
          <PluginProvider>
            <Switch>
              <Route exact path={routes.BASE_URL} component={BaseMeetingCreteFormWrapper} />
              <Route exact path={routes.HOME} component={Home} />
              <Route path={routes.DEVICE}>
                <NoMeetingRedirect>
                  <DeviceSetup />
                </NoMeetingRedirect>
              </Route>
              <Route path={routes.USER_SELECT}>
                <UserModeSelector />
              </Route>
              <Route path={routes.LOBBY}>
                <Lobby />
              </Route>
              <Route path="*" component={ErrorPage}/>
            </Switch>
          </PluginProvider>
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
    spec: { name: getVoiceFocusSpecName() },
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

  const getWrapperWithVideoFilter = (children: React.ReactNode) => {
    let filterCPUUtilization = parseInt(videoTransformCpuUtilization, 10);
    if (!filterCPUUtilization) {
      filterCPUUtilization = 40;
    }
    console.log(`Using ${filterCPUUtilization} background blur and replacement`);
    return (
      <BackgroundBlurProvider options={{ filterCPUUtilization }} >
        <BackgroundReplacementProvider options={{ imageBlob, filterCPUUtilization }} >
          {children}
        </BackgroundReplacementProvider>
      </BackgroundBlurProvider>
    );
  };

  const getMeetingProvider = (children: React.ReactNode) => {
    return (
      <MeetingProvider>
        {children}
      </MeetingProvider>
    );
  };

  const getMeetingProviderWithFeatures = (): React.ReactNode => {
    let children = getMeetingProviderWrapper();

    if (isFilterEnabled) {
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
      {imageBlob === undefined ? <div>Loading Assets</div> : getMeetingProviderWithFeatures()}
    </>
  );
};

export default MeetingProviderWrapper;
