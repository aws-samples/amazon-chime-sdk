// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Logger, POSTLogger } from 'amazon-chime-sdk-js';

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

// Different CPU Utilizations percentage options for initializing background blur and replacement processors
export const VideoFiltersCpuUtilization = {
  Disabled: '0',
  CPU10Percent: '10',
  CPU20Percent: '20',
  CPU40Percent: '40',
};

// Video Transform Options
export const VideoTransformOptions = {
  None: 'None',
  Blur: 'Background Blur',
  Replacement: 'Background Replacement',
};

export type VideoTransformDropdownOptionType = {
  label: string;
  value: string;
};

// Bcakground Replacement Options
export const ReplacementOptions = {
  Blue: 'Blue',
  Beach: 'Beach',
};

export type ReplacementDropdownOptionType = {
  label: string;
  value: string;
};

export type MeetingConfig = {
  simulcastEnabled: boolean;
  logger: Logger;
  postLogger?: POSTLogger; // Keep track of POSTLogger to update meeting metadata while joining a meeting.
};
