// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useRef } from "react";
import { useLocalAudioInputActivityPreview } from "amazon-chime-sdk-component-library-react";

import ActivityBar from "../../ActivityBar";
=======
import React, { useRef } from 'react';
import { useLocalAudioInputActivityPreview } from 'amazon-chime-sdk-component-library-react';

import ActivityBar from '../../ActivityBar';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MicrophoneActivityPreviewBar = () => {
  const activityBarRef = useRef<HTMLDivElement>();
  useLocalAudioInputActivityPreview(activityBarRef);

  return <ActivityBar ref={activityBarRef} />;
};

export default MicrophoneActivityPreviewBar;
