// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import {
  Heading,
  MicSelection,
} from "amazon-chime-sdk-component-library-react";

import { title } from "../Styled";
import MicrophoneActivityPreview from "./MicrophoneActivityPreview";
=======
import React from 'react';
import {
  Heading,
  MicSelection
} from 'amazon-chime-sdk-component-library-react';

import { title } from '../Styled';
import MicrophoneActivityPreview from './MicrophoneActivityPreview';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MicrophoneDevices = () => {
  return (
    <div>
      <Heading tag="h2" level={6} css={title}>
        Audio
      </Heading>
      <MicSelection />
      <MicrophoneActivityPreview />
    </div>
  );
};

export default MicrophoneDevices;
