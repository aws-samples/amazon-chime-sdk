// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState } from "react";
import {
  SpeakerSelection,
  SecondaryButton,
  useAudioOutputs,
} from "amazon-chime-sdk-component-library-react";

import TestSound from "../../../utilities/TestSound";
=======
import React, { useState } from 'react';
import {
  SpeakerSelection,
  SecondaryButton,
  useAudioOutputs
} from 'amazon-chime-sdk-component-library-react';

import TestSound from '../../../utilities/TestSound';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const SpeakerDevices = () => {
  const { selectedDevice } = useAudioOutputs();
  const [selectedOutput, setSelectedOutput] = useState(selectedDevice);

  const handleChange = (deviceId: string): void => {
    setSelectedOutput(deviceId);
  };

  const handleTestSpeaker = () => {
    new TestSound(selectedOutput);
  };

  return (
    <div>
      <SpeakerSelection onChange={handleChange} />
      <SecondaryButton label="Test speakers" onClick={handleTestSpeaker} />
    </div>
  );
};

export default SpeakerDevices;
