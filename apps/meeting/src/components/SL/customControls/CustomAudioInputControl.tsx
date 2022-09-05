// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ControlBarButton,
  isOptionActive,
  Microphone,
  useAudioInputs,
  useLogger,
  useMeetingManager,
  useToggleLocalMute,
} from "amazon-chime-sdk-component-library-react";
import { BaseSdkProps } from "amazon-chime-sdk-component-library-react/lib/components/sdk/Base";
import { PopOverItemProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/PopOver/PopOverItem";
import React from "react";
import { useEffect, useState } from "react";
import { useAppState } from "../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../utils/enums";

interface Props extends BaseSdkProps {
  /** The label that will be shown when microphone is muted , it defaults to `Mute`. */
  muteLabel?: string;
  /** The label that will be shown when microphone is unmuted, it defaults to `Unmute`. */
  unmuteLabel?: string;
  /** Title attribute for the icon when muted, it defaults to `Muted microphone`. */
  mutedIconTitle?: string;
  /** Title attribute for the icon when unmuted, it defaults to `Microphone`. */
  unmutedIconTitle?: string;
}

const CustomAudioInputControl: React.FC<Props> = ({
  muteLabel = "Mute",
  unmuteLabel = "Unmute",
  mutedIconTitle,
  unmutedIconTitle,
  ...rest
}) => {
  const logger = useLogger();
  const meetingManager = useMeetingManager();
  const { muted, toggleMute } = useToggleLocalMute();
  const { devices, selectedDevice } = useAudioInputs();
  const [dropdownOptions, setDropdownOptions] = useState<PopOverItemProps[]>(
    []
  );
  const { joineeType } = useAppState();

  // In future if we make students permissible to unmute themselves
  const [
    studentHasPermissionToUnmute,
    setStudentHasPermissionToUnmute,
  ] = useState<boolean>(false);

  const toggleIfAllowed = () => {
    if (joineeType === USER_TYPES.STUDENT) {
      if (studentHasPermissionToUnmute) {
        toggleMute();
      } else {
        alert("You don't have permission for this.");
      }
    } else {
      toggleMute();
    }
    //Just to avoid webpack error, does nothing, sets current value as current value
    setStudentHasPermissionToUnmute((currentValue) => currentValue);
  };

  useEffect(() => {
    const handleClick = async (deviceId: string): Promise<void> => {
      try {
        await meetingManager.startAudioInputDevice(deviceId);
      } catch (error) {
        logger.error(
          "CustomAudioInputControl failed to select audio input device"
        );
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
    meetingManager,
    meetingManager.startAudioInputDevice,
  ]);

  useEffect(() => {
    // Muting student by default
    joineeType === USER_TYPES.STUDENT && !muted ? toggleMute() : null;
  }, [joineeType])

  return (
    <ControlBarButton
      icon={
        <Microphone
          muted={muted}
          mutedTitle={mutedIconTitle}
          unmutedTitle={unmutedIconTitle}
        />
      }
      onClick={toggleIfAllowed}
      label={muted ? unmuteLabel : muteLabel}
      popOver={dropdownOptions}
      {...rest}
    />
  );
};

export default CustomAudioInputControl;
