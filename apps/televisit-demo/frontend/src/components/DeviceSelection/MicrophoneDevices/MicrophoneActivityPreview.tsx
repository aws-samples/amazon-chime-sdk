// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import { Label } from "amazon-chime-sdk-component-library-react";

import { StyledPreviewGroup } from "../Styled";
import MicrophoneActivityPreviewBar from "./MicrophoneActivityPreviewBar";
=======
import React from 'react';
import { Label } from 'amazon-chime-sdk-component-library-react';

import { StyledPreviewGroup } from '../Styled';
import MicrophoneActivityPreviewBar from './MicrophoneActivityPreviewBar';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MicrophoneActivityPreview = () => {
  return (
    <StyledPreviewGroup>
<<<<<<< HEAD
      <Label style={{ display: "block", marginBottom: ".5rem" }}>
=======
      <Label style={{ display: 'block', marginBottom: '.5rem' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        Microphone activity
      </Label>
      <MicrophoneActivityPreviewBar />
    </StyledPreviewGroup>
  );
};

export default MicrophoneActivityPreview;
