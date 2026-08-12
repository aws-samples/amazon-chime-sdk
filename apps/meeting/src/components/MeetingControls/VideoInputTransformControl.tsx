// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  isVideoTransformDevice,
  ProcessorEffect,
  VideoInputDevice,
} from 'amazon-chime-sdk-js';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash.isequal';
import {
  useBackgroundSegmentation,
  useVideoInputs,
  useLocalVideo,
  ControlBarButton,
  Camera,
  Spinner,
  PopOverItem,
  PopOverSeparator,
  useMeetingManager,
  isOptionActive,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { DeviceType, EffectOption } from '../../types';
import useMemoCompare from '../../utils/use-memo-compare';
import { BackgroundImageEncoding } from '../../utils/BackgroundImage';
import { useAppState } from '../../providers/AppStateProvider';
import { EFFECT_OPTIONS } from '../../constants';

interface Props {
  label?: string;
}

const VideoInputTransformControl: React.FC<Props> = ({ label = 'Video' }) => {
  const meetingManager = useMeetingManager();
  const logger = useLogger();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const {
    isSupported,
    createSegmentationDevice,
    updateEffect,
    updateModelType,
  } = useBackgroundSegmentation();

  const [isLoading, setIsLoading] = useState(false);
  const { selectedEffect, setSelectedEffect, videoTransformCpuUtilization } = useAppState();
  const cpuUsagePercentage = parseInt(videoTransformCpuUtilization, 10) || 30;
  const [dropdownOptions, setDropdownOptions] = useState<ReactNode[] | null>(null);
  // If entering meeting with an effect already applied from preview,
  // selectedDevice is already a VideoTransformDevice — start as active.
  const isProcessorActiveRef = useRef(selectedEffect !== 'none');
  const videoDevices: DeviceType[] = useMemoCompare(
    devices,
    (prev: DeviceType[] | undefined, next: DeviceType[] | undefined): boolean => isEqual(prev, next)
  );

  const selectEffect = async (option: EffectOption) => {
    if (isLoading || !selectedDevice) return;
    if (isSupported === false) {
      logger.warn('[VideoControl] Background segmentation not supported.');
      return;
    }

    try {
      setIsLoading(true);
      logger.info(`[VideoControl] Switching to: ${option.label}`);

      if (!option.config) {
        let current = selectedDevice as any;
        if (isVideoTransformDevice(current)) {
          const intrinsicDevice = await current.intrinsicDevice();
          await current.stop();
          current = intrinsicDevice;
        }
        if (isVideoEnabled) {
          await meetingManager.startVideoInputDevice(current);
        } else {
          await meetingManager.selectVideoInputDevice(current);
        }
        isProcessorActiveRef.current = false;
        logger.info('[VideoControl] Effect set to None');
      } else if (!isProcessorActiveRef.current) {
        let current = selectedDevice as any;
        if (isVideoTransformDevice(current)) {
          const intrinsicDevice = await current.intrinsicDevice();
          await current.stop();
          current = intrinsicDevice;
        }

        let config = option.config;
        if (config.type === ProcessorEffect.IMAGE_REPLACEMENT) {
          const dataUrl = BackgroundImageEncoding();
          config = { type: ProcessorEffect.IMAGE_REPLACEMENT, replacementImageURL: dataUrl };
        }

        const device = await createSegmentationDevice(current, config, {
          modelType: option.modelType,
          cpuUsagePercentage,
        });

        if (isVideoEnabled) {
          await meetingManager.startVideoInputDevice(device);
        } else {
          await meetingManager.selectVideoInputDevice(device);
        }
        isProcessorActiveRef.current = true;
        logger.info(`[VideoControl] Processor created. Effect: ${config.type}, Model: ${option.modelType}, CPU: ${cpuUsagePercentage}%`);
      } else {
        let config = option.config;
        if (config.type === ProcessorEffect.IMAGE_REPLACEMENT) {
          const dataUrl = BackgroundImageEncoding();
          config = { type: ProcessorEffect.IMAGE_REPLACEMENT, replacementImageURL: dataUrl };
        }
        updateModelType(option.modelType);
        updateEffect(config);
        logger.info(`[VideoControl] Seamless switch. Effect: ${config.type}, Model: ${option.modelType}`);
      }

      setSelectedEffect(option.value);
    } catch (error) {
      logger.error(`[VideoControl] Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const buildDropdown = async () => {
      const options: ReactNode[] = [];

      for (const device of videoDevices) {
        options.push(
          <PopOverItem
            key={device.deviceId}
            checked={await isOptionActive(selectedDevice, device.deviceId)}
            onClick={async () => {
              let newDevice: VideoInputDevice = device.deviceId;
              if (isVideoTransformDevice(selectedDevice) && 'chooseNewInnerDevice' in selectedDevice) {
                // @ts-ignore
                newDevice = selectedDevice.chooseNewInnerDevice(device.deviceId);
              }
              if (isVideoEnabled) {
                await meetingManager.startVideoInputDevice(newDevice);
              } else {
                await meetingManager.selectVideoInputDevice(newDevice);
              }
            }}
          >
            <span>{device.label}</span>
          </PopOverItem>
        );
      }

      options.push(<PopOverSeparator key="sep" />);

      for (const option of EFFECT_OPTIONS) {
        options.push(
          <PopOverItem
            key={option.value}
            checked={selectedEffect === option.value}
            disabled={isLoading}
            onClick={() => selectEffect(option)}
          >
            <>
              {isLoading && selectedEffect !== option.value && <Spinner width="1.5rem" height="1.5rem" />}
              {option.label}
            </>
          </PopOverItem>
        );
      }

      setDropdownOptions(options);
    };

    buildDropdown();
  }, [videoDevices, isLoading, isVideoEnabled, selectedDevice, isSupported, selectedEffect]);

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleVideo}
      label={label}
    >
      {dropdownOptions}
    </ControlBarButton>
  );
};

export default VideoInputTransformControl;
