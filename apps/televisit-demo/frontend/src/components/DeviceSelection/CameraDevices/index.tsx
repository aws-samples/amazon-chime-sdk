// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  Heading,
  PreviewVideo,
  QualitySelection,
  CameraSelection,
<<<<<<< HEAD
  Label,
} from "amazon-chime-sdk-component-library-react";

import { title, StyledInputGroup } from "../Styled";
=======
  Label
} from 'amazon-chime-sdk-component-library-react';

import { title, StyledInputGroup } from '../Styled';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const CameraDevices = () => {
  return (
    <div>
      <Heading tag="h2" level={6} css={title}>
        Video
      </Heading>
      <StyledInputGroup>
        <CameraSelection />
      </StyledInputGroup>
      <StyledInputGroup>
        <QualitySelection />
      </StyledInputGroup>
<<<<<<< HEAD
      <Label style={{ display: "block", marginBottom: ".5rem" }}>
=======
      <Label style={{ display: 'block', marginBottom: '.5rem' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        Video preview
      </Label>
      <PreviewVideo />
    </div>
  );
};

export default CameraDevices;
