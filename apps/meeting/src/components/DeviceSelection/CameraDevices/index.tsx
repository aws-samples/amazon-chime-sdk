// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent } from 'react';
import {
  Heading,
  PreviewVideo,
  QualitySelection,
  CameraSelection,
  Label,
  FormField,
  Select,
} from 'amazon-chime-sdk-component-library-react';

import { title, StyledInputGroup } from '../Styled';
import { useAppState } from '../../../providers/AppStateProvider';
import { VideoFiltersCpuUtilization, EFFECT_OPTIONS } from '../../../constants';
import { useBackgroundEffect } from '../../../hooks/useBackgroundEffect';

const SELECT_OPTIONS = EFFECT_OPTIONS.map(o => ({ label: o.label, value: o.value }));

const CameraDevices = () => {
  const { videoTransformCpuUtilization, selectedEffect } = useAppState();
  const videoTransformsEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;
  const { selectEffect, isBusy } = useBackgroundEffect({ alwaysStart: true });

  const handleEffectChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const option = EFFECT_OPTIONS.find(o => o.value === e.target.value);
    if (option) {
      await selectEffect(option);
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
            label={`Video Effect${isBusy ? ' (loading...)' : ''}`}
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
