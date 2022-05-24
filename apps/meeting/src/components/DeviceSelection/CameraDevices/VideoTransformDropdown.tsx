// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Device, isVideoTransformDevice } from 'amazon-chime-sdk-js';
import React, { ChangeEvent, useState } from 'react';
import {
  useBackgroundBlur,
  useBackgroundReplacement,
  FormField,
  Select,
  useVideoInputs,
  useMeetingManager,
} from 'amazon-chime-sdk-component-library-react';
import { VideoTransformOptions, VideoTransformDropdownOptionType } from '../../../types/index';
import { useAppState } from '../../../providers/AppStateProvider';

interface Props {
  /* Title for the dropdown, defaults to `Video Transform Dropdown` */
  label?: string;
}

export const VideoTransformDropdown: React.FC<Props> = ({
  label = 'Video Transform',
}) => {
  const { activeVideoTransformOption, setActiveVideoTransformOption } = useAppState();
  // Both hooks are needed because this component uses both blur and replacement filters.
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } =
    useBackgroundBlur();
  const { isBackgroundReplacementSupported, createBackgroundReplacementDevice } =
    useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const meetingManager = useMeetingManager();
  const { selectedDevice } = useVideoInputs();


  // Available background filter options based off if Background Blur and Replacement ware offered/supported.
  const options: VideoTransformDropdownOptionType[] = [
    {
      label: VideoTransformOptions.None,
      value: VideoTransformOptions.None,
    },
    {
      label: VideoTransformOptions.Blur,
      value: isBackgroundBlurSupported === undefined || isBackgroundBlurSupported === false ? 'Background Blur not supported' : VideoTransformOptions.Blur,
    },
    {
      label: VideoTransformOptions.Replacement,
      value: isBackgroundReplacementSupported === undefined || isBackgroundReplacementSupported === false ? 'Background Replacement not supported' : VideoTransformOptions.Replacement,
    },
  ];

  // Creates a device based on the selections (None, Blur, Replacement) and uses it as input.
  const selectTransform = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedTransform = e.target.value;
    let currentDevice = selectedDevice;

    if (isLoading || currentDevice === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      // If current selectedDevice is a transform device (blur or replacement) then store currentDevice as the intrinsic device for now.
      if (isVideoTransformDevice(currentDevice)) {
        const intrinsicDevice = await currentDevice.intrinsicDevice();
        await currentDevice.stop();
        currentDevice = intrinsicDevice;
      }
      // If the new selection is `Background Blur` then create a blur device. Else if the new selected transform is replacement then create
      // a replacement device. Otherwise, the user selected `None` therefore do nothing because currentDevice is the intrinsic from the above logic.
      if (selectedTransform === VideoTransformOptions.Blur && isBackgroundBlurSupported) {
        currentDevice = await createBackgroundBlurDevice(currentDevice as Device);
      } else if (selectedTransform === VideoTransformOptions.Replacement && isBackgroundReplacementSupported) {
        currentDevice = await createBackgroundReplacementDevice(currentDevice as Device);
      }
      // Select the newly created device from the above logic as the video input device.
      await meetingManager.startVideoInputDevice(currentDevice);
      // Update the current selected transform.
      setActiveVideoTransformOption(selectedTransform);
    } catch (e) {
      console.error('Error trying to apply', selectTransform, e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormField
      field={Select}
      options={options}
      onChange={selectTransform}
      value={activeVideoTransformOption}
      label={label}
    />
  );
};

export default VideoTransformDropdown;
