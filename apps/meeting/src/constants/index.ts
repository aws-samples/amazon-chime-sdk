// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { LogLevel } from 'amazon-chime-sdk-js';

// Background Segmentation Effect Options
import {
  BackgroundSegmentationBlurStrength as BlurStrength,
  ModelType,
  ProcessorEffect,
} from 'amazon-chime-sdk-js';
import { EffectOption } from '../types';

export const AMAZON_CHIME_VOICE_CONNECTOR_PHONE_NUMDER = '+17035550122';

export const VIDEO_INPUT = {
  NONE: 'None',
  BLUE: 'Blue',
  SMPTE: 'SMPTE Color Bars',
};

export const AUDIO_INPUT = {
  NONE: 'None',
  440: '440 Hz',
};

export const MAX_REMOTE_VIDEOS = 25;

export const AVAILABLE_AWS_REGIONS = {
  'us-east-1': 'United States (N. Virginia)',
  'af-south-1': 'Africa (Cape Town)',
  'ap-northeast-1': 'Japan (Tokyo)',
  'ap-northeast-2': 'Korea (Seoul)',
  'ap-south-1': 'India (Mumbai)',
  'ap-southeast-1': 'Singapore',
  'ap-southeast-2': 'Australia (Sydney)',
  'ca-central-1': 'Canada',
  'eu-central-1': 'Germany (Frankfurt)',
  'eu-north-1': 'Sweden (Stockholm)',
  'eu-south-1': 'Italy (Milan)',
  'eu-west-1': 'Ireland',
  'eu-west-2': 'United Kingdom (London)',
  'eu-west-3': 'France (Paris)',
  'sa-east-1': 'Brazil (São Paulo)',
  'us-east-2': 'United States (Ohio)',
  'us-west-1': 'United States (N. California)',
  'us-west-2': 'United States (Oregon)',
};

export const VIDEO_INPUT_QUALITY = {
  '360p': '360p (nHD) @ 15 fps (600 Kbps max)',
  '540p': '540p (qHD) @ 15 fps (1.4 Mbps max)',
  '720p': '720p (HD) @ 15 fps (1.4 Mbps max)',
};

export const SDK_LOG_LEVELS = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  off: LogLevel.OFF,
};

export const DATA_MESSAGE_LIFETIME_MS = 300000;
export const DATA_MESSAGE_TOPIC = 'ChimeComponentLibraryDataMessage';

// Different CPU Utilizations percentage options for initializing background segmentation processor
export const VideoFiltersCpuUtilization = {
  Disabled: '0',
  CPU10Percent: '10',
  CPU20Percent: '20',
  CPU40Percent: '40',
};

export const EFFECT_OPTIONS: EffectOption[] = [
  { label: 'None', value: 'none', config: null, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Blur Low (General)', value: 'blur-low-general', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.LOW }, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Blur Medium (General)', value: 'blur-medium-general', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.MEDIUM }, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Blur High (General)', value: 'blur-high-general', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.HIGH }, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Blur Low (Multiclass)', value: 'blur-low-multiclass', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.LOW }, modelType: ModelType.SELFIE_MULTICLASS },
  { label: 'Blur Medium (Multiclass)', value: 'blur-medium-multiclass', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.MEDIUM }, modelType: ModelType.SELFIE_MULTICLASS },
  { label: 'Blur High (Multiclass)', value: 'blur-high-multiclass', config: { type: ProcessorEffect.BLUR, blurStrength: BlurStrength.HIGH }, modelType: ModelType.SELFIE_MULTICLASS },
  { label: 'Color Blue (General)', value: 'color-general', config: { type: ProcessorEffect.COLOR_REPLACEMENT, replacementColor: '#0000FF' }, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Color Blue (Multiclass)', value: 'color-multiclass', config: { type: ProcessorEffect.COLOR_REPLACEMENT, replacementColor: '#0000FF' }, modelType: ModelType.SELFIE_MULTICLASS },
  { label: 'Image Beach (General)', value: 'image-general', config: { type: ProcessorEffect.IMAGE_REPLACEMENT, replacementImageURL: '' }, modelType: ModelType.SELFIE_GENERAL },
  { label: 'Image Beach (Multiclass)', value: 'image-multiclass', config: { type: ProcessorEffect.IMAGE_REPLACEMENT, replacementImageURL: '' }, modelType: ModelType.SELFIE_MULTICLASS },
];
