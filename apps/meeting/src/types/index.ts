// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { BackgroundSegmentationVideoFrameProcessorConfig, Logger, ModelType, POSTLogger } from 'amazon-chime-sdk-js';

export type FormattedDeviceType = {
  deviceId: string;
  label: string;
};

export type DeviceType = MediaDeviceInfo | FormattedDeviceType;

export type SelectedDeviceType = string | null;

export type DeviceTypeContext = {
  devices: DeviceType[];
  selectedDevice: SelectedDeviceType;
};

export type LocalVideoContextType = {
  isVideoEnabled: boolean;
  toggleVideo: () => Promise<void>;
};

export type DeviceConfig = {
  additionalDevices?: boolean;
};

export type LocalAudioOutputContextType = {
  isAudioOn: boolean;
  toggleAudio: () => void;
};

export type ContentShareControlContextType = {
  isContentSharePaused: boolean;
  toggleContentShare: () => Promise<void>;
  togglePauseContentShare: () => void;
};

export enum MeetingMode {
  Spectator,
  Attendee,
}

export enum Layout {
  Gallery,
  Featured,
}


export type MeetingConfig = {
  simulcastEnabled: boolean;
  logger: Logger;
  postLogger?: POSTLogger; // Keep track of POSTLogger to update meeting metadata while joining a meeting.
};

export interface EffectOption {
  label: string;
  value: string;
  config: BackgroundSegmentationVideoFrameProcessorConfig | null;
  modelType: ModelType;
}
