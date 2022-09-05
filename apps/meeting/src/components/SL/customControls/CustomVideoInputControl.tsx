// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Camera, ControlBarButton, isOptionActive, useLocalVideo, useLogger, useMeetingManager, useVideoInputs } from "amazon-chime-sdk-component-library-react";
import { BaseSdkProps } from "amazon-chime-sdk-component-library-react/lib/components/sdk/Base";
import { PopOverItemProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/PopOver/PopOverItem";
import React from "react";
import { useEffect, useState } from "react";
import { useAppState } from "../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../utils/enums";


interface Props extends BaseSdkProps {
  /** The label that will be shown for video input control, it defaults to `Video`. */
  label?: string;
}

const CustomVideoInputControl: React.FC<Props> = ({ label = 'Video', ...rest }) => {
  const logger = useLogger();
  const meetingManager = useMeetingManager();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const [dropdownOptions, setDropdownOptions] = useState<PopOverItemProps[]>(
    []
  );
  const {joineeType} = useAppState();
  const [studentHasPermissionToStartVideo, setStudentHasPermissionToStartVideo] = useState<boolean>(false);

  const toggleIfAllowed = () => {
    if (joineeType === USER_TYPES.STUDENT) {
      if (studentHasPermissionToStartVideo) {
        toggleVideo();
      } else {
        alert("You don't have permission for this.");
      }
    } else {
      toggleVideo();
    }
    //Just to avoid webpack error, does nothing, sets current value as current value
    setStudentHasPermissionToStartVideo((currentValue) => currentValue);
  };

  useEffect(() => {
    const handleClick = async (deviceId: string): Promise<void> => {
      try {
        if (isVideoEnabled) {
          await meetingManager.startVideoInputDevice(deviceId);
        } else {
          meetingManager.selectVideoInputDevice(deviceId);
        }
      } catch (error) {
        logger.error('CustomVideoInputControl failed to select video input device');
      }
    };

    const getDropdownOptions = async (): Promise<void> => {
      const dropdownOptions = await Promise.all(
        devices.map(async (device) => ({
          children: <span>{device.label}</span>,
          checked: await isOptionActive(selectedDevice, device.deviceId),
          onClick: async () => await handleClick(device.deviceId),
        }))
      );
      setDropdownOptions(dropdownOptions);
    };

    getDropdownOptions();
  }, [
    devices,
    selectedDevice,
    isVideoEnabled,
    meetingManager,
    meetingManager.startVideoInputDevice,
  ]);

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleIfAllowed}
      label={label}
      popOver={dropdownOptions}
      {...rest}
    />
  );
};

export default CustomVideoInputControl;
