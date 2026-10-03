// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { VideoInputDevice } from 'amazon-chime-sdk-js';
import React, { ReactNode, useEffect, useState } from 'react';
import isEqual from 'lodash.isequal';
import {
  useVideoInputs,
  useLocalVideo,
  ControlBarButton,
  Camera,
  Spinner,
  PopOverItem,
  PopOverSeparator,
  useMeetingManager,
  isOptionActive,
} from 'amazon-chime-sdk-component-library-react';
import { DeviceType } from '../../types';
import useMemoCompare from '../../utils/use-memo-compare';
import { useAppState } from '../../providers/AppStateProvider';
import { EFFECT_OPTIONS } from '../../constants';
import {
  useBackgroundEffect,
  canSwapInnerDevice,
} from '../../hooks/useBackgroundEffect';

interface Props {
  label?: string;
}

const VideoInputTransformControl: React.FC<Props> = ({ label = 'Video' }) => {
  const meetingManager = useMeetingManager();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const { selectedEffect } = useAppState();
  const { selectEffect, pendingEffect, isBusy } = useBackgroundEffect();
  const [dropdownOptions, setDropdownOptions] = useState<ReactNode[] | null>(null);
  const videoDevices: DeviceType[] = useMemoCompare(
    devices,
    (prev: DeviceType[] | undefined, next: DeviceType[] | undefined): boolean => isEqual(prev, next)
  );

  useEffect(() => {
    const buildDropdown = async () => {
      const options: ReactNode[] = [];

      for (const device of videoDevices) {
        options.push(
          <PopOverItem
            key={device.deviceId}
            checked={await isOptionActive(selectedDevice, device.deviceId)}
            disabled={isBusy}
            onClick={async () => {
              let newDevice: VideoInputDevice = device.deviceId;
              if (canSwapInnerDevice(selectedDevice)) {
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
            disabled={isBusy}
            onClick={() => selectEffect(option)}
          >
            <>
              {pendingEffect === option.value && <Spinner width="1.5rem" height="1.5rem" />}
              {option.label}
            </>
          </PopOverItem>
        );
      }

      setDropdownOptions(options);
    };

    buildDropdown();
  }, [videoDevices, isBusy, pendingEffect, isVideoEnabled, selectedDevice, selectedEffect]);

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
