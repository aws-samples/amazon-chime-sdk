// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { PropsWithChildren } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AudioInputDevice, VoiceFocusModelName, VoiceFocusTransformDevice } from 'amazon-chime-sdk-js';
import {
  BackgroundBlurProvider,
  BackgroundReplacementProvider,
  MeetingProvider,
  useLogger,
  useVoiceFocus,
  VoiceFocusProvider,
} from 'amazon-chime-sdk-component-library-react';
import { useAppState } from '../../providers/AppStateProvider';

import routes from '../../constants/routes';
import { NavigationProvider } from '../../providers/NavigationProvider';
import NoMeetingRedirect from '../NoMeetingRedirect';
import { Meeting, Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';
import { VideoFiltersCpuUtilization } from '../../types';

const MeetingProviderWithDeviceReplacement: React.FC<PropsWithChildren> = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();
  const { enableMaxContentShares } = useAppState();

  const onDeviceReplacement = (nextDevice: string, currentDevice: AudioInputDevice) => {
    if (currentDevice instanceof VoiceFocusTransformDevice) {
      return addVoiceFocus(nextDevice);
    }
    return Promise.resolve(nextDevice);
  };

  const meetingConfigValue = {
    onDeviceReplacement: onDeviceReplacement as any,
    ...(enableMaxContentShares ? { maxContentShares: 2 } : {}),
  };

  return <MeetingProvider {...meetingConfigValue}>{children}</MeetingProvider>;
};

const MeetingProviderWrapper: React.FC = () => {
  const { isWebAudioEnabled, videoTransformCpuUtilization, imageBlob, joinInfo } = useAppState();
  const logger = useLogger();

  const isFilterEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;

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

  function voiceFocusName(name: string): VoiceFocusModelName {
    if (name && ['default', 'ns_es'].includes(name)) {
      return name as VoiceFocusModelName;
    }
    return 'default';
  }

  function getVoiceFocusSpecName(): VoiceFocusModelName {
    if (joinInfo && joinInfo.Meeting?.MeetingFeatures?.Audio?.EchoReduction === 'AVAILABLE') {
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
        <MeetingProviderWithDeviceReplacement>{children}</MeetingProviderWithDeviceReplacement>
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
      <BackgroundBlurProvider options={{ filterCPUUtilization, logger }}>
        <BackgroundReplacementProvider options={{ imageBlob, filterCPUUtilization, logger }}>
          {children}
        </BackgroundReplacementProvider>
      </BackgroundBlurProvider>
    );
  };

  const getMeetingProvider = (children: React.ReactNode) => {
    return <MeetingProvider>{children}</MeetingProvider>;
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

  return <>{imageBlob === undefined ? <div>Loading Assets</div> : getMeetingProviderWithFeatures()}</>;
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default MeetingProviderWrapper;
