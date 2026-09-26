// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useState } from 'react';
import {
  Heading,
  PreviewVideo,
  QualitySelection,
  CameraSelection,
  Label,
  FormField,
  Select,
  useBackgroundSegmentation,
  useVideoInputs,
  useMeetingManager,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import {
  isVideoTransformDevice,
  ProcessorEffect,
} from 'amazon-chime-sdk-js';

import { title, StyledInputGroup } from '../Styled';
import { useAppState } from '../../../providers/AppStateProvider';
import { VideoFiltersCpuUtilization, EFFECT_OPTIONS } from '../../../constants';
import { BackgroundImageEncoding } from '../../../utils/BackgroundImage';

const SELECT_OPTIONS = EFFECT_OPTIONS.map(o => ({ label: o.label, value: o.value }));

const CameraDevices = () => {
  const logger = useLogger();
  const meetingManager = useMeetingManager();
  const { selectedDevice } = useVideoInputs();
  const {
    isSupported,
    createSegmentationDevice,
    updateEffect,
    updateModelType,
  } = useBackgroundSegmentation();

  const { videoTransformCpuUtilization, selectedEffect, setSelectedEffect } = useAppState();
  const videoTransformsEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessorActive, setIsProcessorActive] = useState(false);

  const cpuUsagePercentage = parseInt(videoTransformCpuUtilization, 10) || 30;

  const handleEffectChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const option = EFFECT_OPTIONS.find(o => o.value === newValue);
    if (!option || isLoading || !selectedDevice) return;

    if (isSupported === false) {
      logger.warn('[CameraDevices] Background segmentation not supported.');
      return;
    }

    try {
      setIsLoading(true);
      logger.info(`[CameraDevices] Switching to: ${option.label}`);

      if (!option.config) {
        let current = selectedDevice as any;
        if (isVideoTransformDevice(current)) {
          const intrinsicDevice = await current.intrinsicDevice();
          await current.stop();
          current = intrinsicDevice;
        }
        await meetingManager.startVideoInputDevice(current);
        setIsProcessorActive(false);
        logger.info('[CameraDevices] Effect set to None');
      } else if (!isProcessorActive) {
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
        await meetingManager.startVideoInputDevice(device);
        setIsProcessorActive(true);
        logger.info(`[CameraDevices] Processor created. Effect: ${config.type}, Model: ${option.modelType}, CPU: ${cpuUsagePercentage}%`);
      } else {
        let config = option.config;
        if (config.type === ProcessorEffect.IMAGE_REPLACEMENT) {
          const dataUrl = BackgroundImageEncoding();
          config = { type: ProcessorEffect.IMAGE_REPLACEMENT, replacementImageURL: dataUrl };
        }

        updateModelType(option.modelType);
        updateEffect(config);
        logger.info(`[CameraDevices] Seamless switch. Effect: ${config.type}, Model: ${option.modelType}`);
      }

      setSelectedEffect(newValue);
    } catch (error) {
      logger.error(`[CameraDevices] Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

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

      {videoTransformsEnabled && (
        <StyledInputGroup>
          <FormField
            field={Select}
            options={SELECT_OPTIONS}
            onChange={handleEffectChange}
            value={selectedEffect}
            label={`Video Effect${isLoading ? ' (loading...)' : ''}`}
          />
        </StyledInputGroup>
      )}

      <Label style={{ display: 'block', marginBottom: '.5rem' }}>
        Video preview
      </Label>
      <PreviewVideo />
    </div>
  );
};

export default CameraDevices;
