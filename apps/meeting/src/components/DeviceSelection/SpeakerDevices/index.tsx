// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  SpeakerSelection,
  SecondaryButton,
  useAudioOutputs,
} from 'amazon-chime-sdk-component-library-react';

import TestSound from '../../../utils/TestSound';

const SpeakerDevices = () => {
  const { selectedDevice } = useAudioOutputs();

  const handleTestSpeaker = () => {
    new TestSound(selectedDevice);
  };

  return (
    <div>
      <SpeakerSelection />
      <SecondaryButton label="Test speakers" onClick={handleTestSpeaker} />
    </div>
  );
};

export default SpeakerDevices;
