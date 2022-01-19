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
import { VIDEO_TRANSFORM_OPTIONS, optionsType } from '../../../types/index';

interface Props {
  /* Title for the dropdown, defaults to `Video Transform Dropdown` */
  label?: string;
}

export const VideoTransformDropdown: React.FC<Props> = ({
  label = 'Video Transform Dropdown',
}) => {
  const [transformOption, setTransformOption] = useState(VIDEO_TRANSFORM_OPTIONS.none);
  // Both hooks are needed because this componnent uses both blur and replacement filters.
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } =  
    useBackgroundBlur();
  const { isBackgroundReplacementSupported, createBackgroundReplacementDevice } =  
    useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const meetingManager = useMeetingManager();
  const [activeVideoDevice, setDevice] = useState<Device | VideoTransformDevice | null>(
    meetingManager.selectedVideoInputTransformDevice
  );
  
  // Available background filter options based off if Background Blur and Replacement ware offered/supported.
  const options: optionsType[] = [
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
  
  // Creates a device based on the selections (None, Blur, Replacement) and uses it as input.
  async function selectTransform(e: ChangeEvent<HTMLSelectElement>) {
    const selectedTransform = e.target.value;
    let currentDevice = activeVideoDevice;

    if (isLoading || currentDevice == null) {
      return;
    }
    setIsLoading(true);
    // If current device activeVideoDevice is a transform device (blur or replacement) then store currentDevice as the intrinisc device for now.
    if (isVideoTransformDevice(currentDevice)) {
      const intrinsicDevice = await currentDevice.intrinsicDevice();
      await currentDevice.stop();
      currentDevice = intrinsicDevice;
    }
    // If the new selection is `Background Blur` then create a blur device. Else if the new selected transform is replacement then create
    // a replacement device. Otherwise, the user selected `None` therefore do nothing because currentDevice is the intrinisc from the above logic.
    if (selectedTransform == VIDEO_TRANSFORM_OPTIONS.blur && isBackgroundBlurSupported) {
      currentDevice = await createBackgroundBlurDevice(activeVideoDevice as Device);
    } else if (selectedTransform == VIDEO_TRANSFORM_OPTIONS.replacement && isBackgroundReplacementSupported) {
      currentDevice = await createBackgroundReplacementDevice(activeVideoDevice as Device);
    }
    // Select the newly created device from the above logic as the video input device.
    await meetingManager.selectVideoInputDevice(currentDevice);
    // Update the current selected transform.
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
