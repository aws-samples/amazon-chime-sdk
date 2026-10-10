// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from 'react';
import {
  Heading,
  MicSelection,
  useMeetingManager,
} from 'amazon-chime-sdk-component-library-react';

import { title } from '../Styled';
import MicrophoneActivityPreview from './MicrophoneActivityPreview';
import { useAppState } from '../../../providers/AppStateProvider';

const MicrophoneDevices = () => {
  const meetingManager = useMeetingManager();
  const { isPreMeetingDeviceSetupAllowed } = useAppState();
  const [previewKey, setPreviewKey] = useState(0);

  // On rejoin the opt-in flow keeps the mic selection but leave() stopped the mic, and
  // listAndSelectDevices only starts a mic when none is selected, so restart it here. The activity
  // preview attaches to the mic only when the selected device changes, so remount it once the
  // restarted mic is live.
  useEffect(() => {
    const persistedMic = meetingManager.selectedAudioInputDevice;
    if (!isPreMeetingDeviceSetupAllowed || !persistedMic) {
      return;
    }
    let isMounted = true;
    meetingManager
      .startAudioInputDevice(persistedMic)
      .then(() => isMounted && setPreviewKey((key) => key + 1))
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [meetingManager, isPreMeetingDeviceSetupAllowed]);

  return (
    <div>
      <Heading tag="h2" level={6} css={title}>
        Audio
      </Heading>
      <MicSelection />
      <MicrophoneActivityPreview key={previewKey} />
    </div>
  );
};

export default MicrophoneDevices;
