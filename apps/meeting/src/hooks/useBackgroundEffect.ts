// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useRef, useState } from 'react';
import {
  Device,
  isVideoTransformDevice,
  ProcessorEffect,
  VideoInputDevice,
  VideoTransformDevice,
} from 'amazon-chime-sdk-js';
import {
  useBackgroundSegmentation,
  useMeetingManager,
  useVideoInputs,
  useLocalVideo,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';

import { EffectOption } from '../types';
import { BackgroundImageEncoding } from '../utils/BackgroundImage';
import { useAppState } from '../providers/AppStateProvider';

// A transform device that can swap its inner (camera) device. We detect it by
// duck-typing rather than `instanceof DefaultVideoTransformDevice` because the
// demo and the component library each bundle their own copy of
// amazon-chime-sdk-js, so a cross-copy `instanceof` check is always false.
type SwappableTransformDevice = VideoTransformDevice & {
  chooseNewInnerDevice: (device: Device) => VideoInputDevice;
};

export const canSwapInnerDevice = (
  d: VideoInputDevice | undefined
): d is SwappableTransformDevice =>
  isVideoTransformDevice(d) &&
  typeof (d as SwappableTransformDevice).chooseNewInnerDevice === 'function';

interface Options {
  /**
   * Always start the video input device, even when local video is off. The
   * device-setup preview needs the device started to render the transformed
   * feed; the in-meeting control respects the user's video on/off state.
   */
  alwaysStart?: boolean;
}

interface UseBackgroundEffect {
  /** Apply or switch to the given effect option (None disables). */
  selectEffect: (option: EffectOption) => Promise<void>;
  /** The option value currently being switched to, or null when idle. */
  pendingEffect: string | null;
  /** True while a switch is in flight. */
  isBusy: boolean;
}

export const useBackgroundEffect = (
  { alwaysStart = false }: Options = {}
): UseBackgroundEffect => {
  const logger = useLogger();
  const meetingManager = useMeetingManager();
  const { selectedDevice } = useVideoInputs();
  const { isVideoEnabled } = useLocalVideo();
  const {
    isSupported,
    createSegmentationDevice,
    updateEffect,
    updateModelType,
  } = useBackgroundSegmentation();
  const { videoTransformCpuUtilization, selectedEffect, setSelectedEffect } = useAppState();
  const cpuUsagePercentage = parseInt(videoTransformCpuUtilization, 10) || 30;

  const [pendingEffect, setPendingEffect] = useState<string | null>(null);
  // Tracks whether a processor is attached. Initialized from the persisted
  // effect so entering the meeting with a preview effect is already active.
  const isProcessorActiveRef = useRef(selectedEffect !== 'none');

  const applyDevice = async (device: VideoInputDevice): Promise<void> => {
    if (alwaysStart || isVideoEnabled) {
      await meetingManager.startVideoInputDevice(device);
    } else {
      await meetingManager.selectVideoInputDevice(device);
    }
  };

  // Resolve the effect config, injecting the encoded image for image
  // replacement (the constant stores an empty URL).
  const resolveConfig = (option: EffectOption) => {
    if (option.config?.type === ProcessorEffect.IMAGE_REPLACEMENT) {
      return {
        type: ProcessorEffect.IMAGE_REPLACEMENT,
        replacementImageURL: BackgroundImageEncoding(),
      } as const;
    }
    return option.config;
  };

  const selectEffect = async (option: EffectOption): Promise<void> => {
    if (pendingEffect !== null || !selectedDevice) {
      return;
    }
    if (isSupported === false) {
      logger.warn('[useBackgroundEffect] Background segmentation not supported.');
      return;
    }

    try {
      setPendingEffect(option.value);
      logger.info(`[useBackgroundEffect] Switching to: ${option.label}`);

      const config = resolveConfig(option);

      if (!config) {
        // None — stop any transform device and return to the raw camera.
        let current: VideoInputDevice = selectedDevice;
        if (isVideoTransformDevice(current)) {
          const intrinsicDevice = await current.intrinsicDevice();
          await current.stop();
          current = intrinsicDevice;
        }
        await applyDevice(current);
        isProcessorActiveRef.current = false;
        logger.info('[useBackgroundEffect] Effect set to None');
      } else if (!isProcessorActiveRef.current) {
        // No processor yet — create a segmentation device and apply it.
        let current: VideoInputDevice = selectedDevice;
        if (isVideoTransformDevice(current)) {
          const intrinsicDevice = await current.intrinsicDevice();
          await current.stop();
          current = intrinsicDevice;
        }
        const device = await createSegmentationDevice(current as Device, config, {
          modelType: option.modelType,
          cpuUsagePercentage,
        });
        await applyDevice(device);
        isProcessorActiveRef.current = true;
        logger.info(
          `[useBackgroundEffect] Processor created. Effect: ${config.type}, Model: ${option.modelType}, CPU: ${cpuUsagePercentage}%`
        );
      } else {
        // Processor already attached — seamless switch, no device recreation.
        updateModelType(option.modelType);
        updateEffect(config);
        logger.info(
          `[useBackgroundEffect] Seamless switch. Effect: ${config.type}, Model: ${option.modelType}`
        );
      }

      setSelectedEffect(option.value);
    } catch (error) {
      logger.error(`[useBackgroundEffect] Error: ${error}`);
    } finally {
      setPendingEffect(null);
    }
  };

  return { selectEffect, pendingEffect, isBusy: pendingEffect !== null };
};
