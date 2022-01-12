// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Device,
  isVideoTransformDevice,
  VideoTransformDevice,
} from 'amazon-chime-sdk-js';
import React, { ChangeEvent, useState, useEffect } from 'react';
import { useBackgroundBlur } from 'amazon-chime-sdk-component-library-react';
import { useBackgroundReplacement } from 'amazon-chime-sdk-component-library-react';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { FormField } from 'amazon-chime-sdk-component-library-react';
import { Select } from 'amazon-chime-sdk-component-library-react';
import { VIDEO_TRANSFORM_OPTIONS } from '../../../types/index';

interface Props {
  /* Title for the dropdown */
  label?: string;
}

export const VideoTransformDropdown: React.FC<Props> = ({
  label = 'Video Transform Dropdown',
}) => {
  const [transformOption, setTransformOption] = useState(VIDEO_TRANSFORM_OPTIONS.none);
  const {isBackgroundBlurSupported,createBackgroundBlurDevice} =  
    useBackgroundBlur();
  const {isBackgroundReplacementSupported,createBackgroundReplacementDevice} =  
    useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const meetingManager = useMeetingManager();
  const [activeVideoDevice, setDevice] = useState<Device | VideoTransformDevice | null>(
    meetingManager.selectedVideoInputTransformDevice
  );

  // Available background filter options
  // @ts-ignore
  const options: {}[] = [
    {
      label: VIDEO_TRANSFORM_OPTIONS.none,
      value: VIDEO_TRANSFORM_OPTIONS.none,
    },
    {
      label: VIDEO_TRANSFORM_OPTIONS.blur,
      value: isBackgroundBlurSupported === undefined || isBackgroundBlurSupported == false ? 'Background Blur not supported' : VIDEO_TRANSFORM_OPTIONS.blur,
    },
    {
      label: VIDEO_TRANSFORM_OPTIONS.replacement,
      value: isBackgroundReplacementSupported === undefined || isBackgroundReplacementSupported == false ? 'Background Replacement not supported' : VIDEO_TRANSFORM_OPTIONS.replacement, 
    },
  ];
  
  useEffect(() => {
    meetingManager.subscribeToSelectedVideoInputTransformDevice(setDevice);
    return () => {
      meetingManager.unsubscribeFromSelectedVideoInputTranformDevice(setDevice);
    };
  }, []);

  async function selectTransform(e: ChangeEvent<HTMLSelectElement>) {
    const selectedTransform = e.target.value;
    let currentDevice = activeVideoDevice;

    if (isLoading || currentDevice == null) {
      return;
    }
    setIsLoading(true);

    if (isVideoTransformDevice(currentDevice)) {
      const intrinsicDevice = await currentDevice.intrinsicDevice();
      await currentDevice.stop();
      currentDevice = intrinsicDevice;
    }
    
    if (selectedTransform == VIDEO_TRANSFORM_OPTIONS.blur && isBackgroundBlurSupported) {
      currentDevice = await createBackgroundBlurDevice(activeVideoDevice as Device);
    } else if (selectedTransform == VIDEO_TRANSFORM_OPTIONS.replacement && isBackgroundReplacementSupported) {
      currentDevice = await createBackgroundReplacementDevice(activeVideoDevice as Device);
    }

    await meetingManager.selectVideoInputDevice(currentDevice);
    setTransformOption(selectedTransform);
    setIsLoading(false);
  }

  return (
    <FormField
      field={Select}
      options={options}
      onChange={selectTransform}
      value={transformOption}
      label={label}
    />
  );
};

export default VideoTransformDropdown;
