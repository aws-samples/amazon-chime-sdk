// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Device,
  isVideoTransformDevice,
  VideoTransformDevice,
} from 'amazon-chime-sdk-js';
import React, { ReactNode, useEffect, useState } from 'react';

import isEqual from 'lodash.isequal';

import { useBackgroundBlur } from 'amazon-chime-sdk-component-library-react';
import { useBackgroundReplacement } from 'amazon-chime-sdk-component-library-react';
import { useVideoInputs } from 'amazon-chime-sdk-component-library-react';
import { useLocalVideo } from 'amazon-chime-sdk-component-library-react';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import {
  isOptionActive,
  videoInputSelectionToDevice,
} from '../../utils/device-utils';
import { ControlBarButton } from 'amazon-chime-sdk-component-library-react';
import { Camera, Spinner } from 'amazon-chime-sdk-component-library-react';
import { PopOverItem } from 'amazon-chime-sdk-component-library-react';
import { PopOverSeparator } from 'amazon-chime-sdk-component-library-react';
import { DeviceType } from '../../types';
import useMemoCompare from '../../utils/use-memo-compare';
import { VIDEO_TRANSFORM_OPTIONS } from '../../types/index';

interface Props {
  /** The label that will be shown for video input control, it defaults to `Video`. */
  label?: string;
  /** The label that will be shown for the background blur button, it defaults to 'Enable Background Blur'. */
  backgroundBlurLabel?: string;
  /** The label that will be shown for the background replacement button, it defaults to 'Enabled Background Replacement'. */
  backgroundReplacementLabel?: string;
}


const VideoInputTransformControl: React.FC<Props> = ({
  label = 'Video',
  backgroundBlurLabel = 'Enable Background Blur',
  backgroundReplacementLabel = 'Enable Background Replacement',
}) => {
  const meetingManager = useMeetingManager();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } = useBackgroundBlur();
  const { isBackgroundReplacementSupported, createBackgroundReplacementDevice } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownWithVideoTransformOptions, setDropdownWithVideoTransformOptions] = useState<ReactNode[] | null>(null);
  const [activeVideoDevice, setDevice] = useState<Device | VideoTransformDevice | null>(meetingManager.selectedVideoInputTransformDevice as Device);
  const [activeTransform, setActiveTransform] = useState<string>(VIDEO_TRANSFORM_OPTIONS.none);

  const videoDevices: DeviceType[] = useMemoCompare(devices, (prev: DeviceType[] | undefined, next: DeviceType[] | undefined): boolean => isEqual(prev, next));

  useEffect(() => {
    meetingManager.subscribeToSelectedVideoInputTransformDevice(setDevice);
    resetDeviceToIntrinsic();
    return () => {
      meetingManager.unsubscribeFromSelectedVideoInputTranformDevice(setDevice);
    };
  }, []);

  async function resetDeviceToIntrinsic() {
    let current = activeVideoDevice;
    if (isVideoTransformDevice(current)) {
      const intrinsicDevice = await current.intrinsicDevice();
      current = intrinsicDevice;
    }
    await meetingManager.selectVideoInputDevice(current);
  }

  async function toggleBackgroundBlur() {
    let current = activeVideoDevice;
    
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    if (!isVideoTransformDevice(current)) {
      // Enable video transform on the non-transformed device
      current = await createBackgroundBlurDevice(current) as VideoTransformDevice;
      meetingManager.logger?.info('Video filter turned on - selecting video transform device: ' + JSON.stringify(current));
    } else {
      // Switch back to intrinsicDevice
      const intrinsicDevice = await current.intrinsicDevice();
      // Stop existing VideoTransformDevice
      await current.stop();

      current = intrinsicDevice;
      
      // Switch to background blur device if old selection was background replacement
      if (activeTransform == VIDEO_TRANSFORM_OPTIONS.replacement) {
        current = await createBackgroundBlurDevice(current) as VideoTransformDevice;
        meetingManager.logger?.info('Video filter was turned on - video transform device: ' + JSON.stringify(current));
      }else{
        meetingManager.logger?.info('Video filter was turned off - selecting inner device: ' + JSON.stringify(current));
      }
    }
    await meetingManager.selectVideoInputDevice(current);

    setActiveTransform(activeTransform => activeTransform == VIDEO_TRANSFORM_OPTIONS.blur ? VIDEO_TRANSFORM_OPTIONS.none : VIDEO_TRANSFORM_OPTIONS.blur);
    setIsLoading(false);
  }

  async function toggleBackgroundReplacement() {
    let current = activeVideoDevice;

    if (isLoading) {
      return;
    }
    setIsLoading(true);

    if (!isVideoTransformDevice(current)) {
      // Enable video transform on the non-transformed device
      current = await createBackgroundReplacementDevice(current) as VideoTransformDevice;
      meetingManager.logger?.info('Video filter turned on - selecting video transform device: ' + JSON.stringify(current));
    } else {
      // Switch back to intrinsicDevic
      const intrinsicDevice = await current.intrinsicDevice();
      // Stop existing VideoTransformDevice
      await current.stop();
      
      current = intrinsicDevice;
      
      // Switch to background replacement device if old selection was background blur
      if (activeTransform == VIDEO_TRANSFORM_OPTIONS.blur) {
        current = await createBackgroundReplacementDevice(current) as VideoTransformDevice;
        meetingManager.logger?.info('Video filter turned on - selecting video transform device: ' + JSON.stringify(current));
      } else {
        meetingManager.logger?.info('Video filter was turned off - selecting inner device: ' + JSON.stringify(current));
      }
    }

    await meetingManager.selectVideoInputDevice(current);
    setActiveTransform(activeTransform => activeTransform == VIDEO_TRANSFORM_OPTIONS.replacement ? VIDEO_TRANSFORM_OPTIONS.none : VIDEO_TRANSFORM_OPTIONS.replacement);
    setIsLoading(false);
  }

  useEffect(() => {
    const deviceOptions: ReactNode[] = videoDevices.map((option) => (
      <PopOverItem
        key={option.deviceId}
        // @ts-ignore
        checked={isOptionActive(selectedDevice, option.deviceId)}
        onClick={async (): Promise<void> => {
          // If background blur/replacement is on, then re-use the same video transform pipeline, but replace the inner device
          // If background blur/replacement is not on, then do a normal video selection
          if (isVideoTransformDevice(activeVideoDevice) && !isLoading) {
            setIsLoading(true);
            const receivedDevice = videoInputSelectionToDevice(option.deviceId);
            if ('chooseNewInnerDevice' in activeVideoDevice) {
              // @ts-ignore
              const transformedDevice = activeVideoDevice.chooseNewInnerDevice(receivedDevice);
              await meetingManager.selectVideoInputDevice(transformedDevice);
            } else {
              meetingManager.logger?.error('Transform device cannot choose new inner device');
            }
            setIsLoading(false);
          } else {
            await meetingManager.selectVideoInputDevice(option.deviceId);
          }
        }}
      >
        <><span>{option.label}</span></>
      </PopOverItem>

    ));
    if (isBackgroundBlurSupported) {
      const videoTransformOptions: ReactNode = (
        <PopOverItem
          key="backgroundBlurFilter"
          checked={activeTransform == VIDEO_TRANSFORM_OPTIONS.blur}
          disabled={isLoading}
          onClick={toggleBackgroundBlur}
        >
          <>
            {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
            {backgroundBlurLabel}
          </>
        </PopOverItem>
      );
      deviceOptions.push(<PopOverSeparator key="separator1" />);
      deviceOptions.push(videoTransformOptions);
    }
    if (isBackgroundReplacementSupported) {
      const videoTransformOptions: ReactNode = (
        <PopOverItem
          key="backgroundReplacementFilter"
          checked={activeTransform == VIDEO_TRANSFORM_OPTIONS.replacement}
          disabled={isLoading}
          onClick={toggleBackgroundReplacement}
        >
          <>
            {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
            {backgroundReplacementLabel}
          </>
        </PopOverItem>
      );
      deviceOptions.push(<PopOverSeparator key="separator2" />);
      deviceOptions.push(videoTransformOptions);
    }

    setDropdownWithVideoTransformOptions(deviceOptions);
  }, [
    createBackgroundBlurDevice,
    createBackgroundReplacementDevice,
    activeVideoDevice,
    videoDevices,
    isLoading,
    selectedDevice,
    isBackgroundBlurSupported,
    isBackgroundReplacementSupported,
  ]);

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleVideo}
      label={label}
    >
      {dropdownWithVideoTransformOptions}
    </ControlBarButton>
  );
};

export default VideoInputTransformControl;
