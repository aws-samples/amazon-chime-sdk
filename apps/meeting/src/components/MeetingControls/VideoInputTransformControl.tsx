// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { isVideoTransformDevice, VideoInputDevice, VideoTransformDevice } from 'amazon-chime-sdk-js';
import React, { ReactNode, useEffect, useState } from 'react';
import isEqual from 'lodash.isequal';
import {
  useBackgroundBlur,
  useBackgroundReplacement,
  useVideoInputs,
  useLocalVideo,
  ControlBarButton,
  Camera,
  Spinner,
  PopOverItem,
  PopOverSeparator,
  PopOverSubMenu,
  useMeetingManager,
  isOptionActive,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { DeviceType } from '../../types';
import useMemoCompare from '../../utils/use-memo-compare';
import { VideoTransformOptions, ReplacementOptions } from '../../types/index';
import { createBlob } from '../../utils/image';
import { useAppState } from '../../providers/AppStateProvider';

interface Props {
  /** The label that will be shown for video input control, it defaults to `Video`. */
  label?: string;
  /** The label that will be shown for the background blur button, it defaults to 'Enable Background Blur'. */
  backgroundBlurLabel?: string;
  /** The label that will be shown for the background replacement button, it defaults to 'Enable Background Replacement'. */
  backgroundReplacementLabel?: string;
}

const VideoInputTransformControl: React.FC<Props> = ({
  label = 'Video',
  backgroundBlurLabel = 'Enable Background Blur',
  backgroundReplacementLabel = 'Enable Background Replacement',
}) => {
  const meetingManager = useMeetingManager();
  const logger = useLogger();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const { isBackgroundBlurSupported, createBackgroundBlurDevice } = useBackgroundBlur();
  const { isBackgroundReplacementSupported, createBackgroundReplacementDevice, changeBackgroundReplacementImage, backgroundReplacementProcessor } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownWithVideoTransformOptions, setDropdownWithVideoTransformOptions] = useState<ReactNode[] | null>(null);
  const [activeVideoTransformOption, setActiveVideoTransformOption] = useState<string>(VideoTransformOptions.None);
  const videoDevices: DeviceType[] = useMemoCompare(devices, (prev: DeviceType[] | undefined, next: DeviceType[] | undefined): boolean => isEqual(prev, next));
  const { backgroundReplacementOption, setBackgroundReplacementOption, replacementOptionsList } = useAppState();

  useEffect(() => {
    resetDeviceToIntrinsic();
  }, []);

  // Reset the video input to intrinsic if current video input is a transform device because this component
  // does not know if blur or replacement was selected. This depends on how the demo is set up.
  // TODO: use a hook in the appState to track whether blur or replacement was selected before this component mounts,
  // or maintain the state of `activeVideoTransformOption` in `MeetingManager`.
  const resetDeviceToIntrinsic = async () => {
    try {
      if (isVideoTransformDevice(selectedDevice)) {
        const intrinsicDevice = await selectedDevice.intrinsicDevice();
        await meetingManager.selectVideoInputDevice(intrinsicDevice);
      }
    } catch (error) {
      logger.error('Failed to reset Device to intrinsic device');
    }
  };

  // Toggle background blur on/off.
  const toggleBackgroundBlur = async () => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);

      if (!isVideoTransformDevice(current)) {
        // Enable video transform on the default device.
        current = await createBackgroundBlurDevice(current) as VideoTransformDevice;
        logger.info(`Video filter turned on - selecting video transform device: ${JSON.stringify(current)}`);
      } else {
        // Switch back to intrinsicDevice.
        const intrinsicDevice = await current.intrinsicDevice();
        // Stop existing VideoTransformDevice.
        await current.stop();
        current = intrinsicDevice;
        // Switch to background blur device if old selection was background replacement otherwise switch to default intrinsic device.
        if (activeVideoTransformOption === VideoTransformOptions.Replacement) {
          current = await createBackgroundBlurDevice(current) as VideoTransformDevice;
          logger.info(`Video filter was turned on - video transform device: ${JSON.stringify(current)}`);
        } else {
          logger.info(`Video filter was turned off - selecting inner device: ${JSON.stringify(current)}`);
        }
      }

      if (isVideoEnabled) {
        // Use the new created video device as input.
        await meetingManager.startVideoInputDevice(current);
      } else {
        // Select the new created video device but don't start it.
        await meetingManager.selectVideoInputDevice(current);
      }

      // Update the current selected transform.
      setActiveVideoTransformOption((activeVideoTransformOption) =>
        activeVideoTransformOption === VideoTransformOptions.Blur
          ? VideoTransformOptions.None
          : VideoTransformOptions.Blur
      );

    } catch (e) {
      logger.error(`Error trying to toggle background blur ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackgroundReplacement = async () => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      if (!isVideoTransformDevice(current)) {
        // Enable video transform on the non-transformed device.
        current = await createBackgroundReplacementDevice(current) as VideoTransformDevice;
        logger.info(`Video filter turned on - selecting video transform device: ${JSON.stringify(current)}`);
      } else {
        // Switch back to intrinsicDevice.
        const intrinsicDevice = await current.intrinsicDevice();
        // Stop existing VideoTransformDevice.
        await current.stop();
        current = intrinsicDevice;
        // Switch to background replacement device if old selection was background blur otherwise switch to default intrinsic device.
        if (activeVideoTransformOption === VideoTransformOptions.Blur) {
          current = await createBackgroundReplacementDevice(current) as VideoTransformDevice;
          logger.info(`Video filter turned on - selecting video transform device: ${JSON.stringify(current)}`);
        } else {
          logger.info(`Video filter was turned off - selecting inner device: ${JSON.stringify(current)}`);
        }
      }

      if (isVideoEnabled) {
        // Use the new created video device as input.
        await meetingManager.startVideoInputDevice(current);
      } else {
        // Select the new created video device but don't start it.
        await meetingManager.selectVideoInputDevice(current);
      }

      // Update the current selected transform.
      setActiveVideoTransformOption((activeVideoTransformOption) =>
        activeVideoTransformOption === VideoTransformOptions.Replacement
          ? VideoTransformOptions.None
          : VideoTransformOptions.Replacement
      );

    } catch (e) {
      logger.error(`Error trying to toggle background replacement ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const changeBackgroundReplacementOption = async (replacementOption: string) => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      const selectedOption = replacementOptionsList.find(option => replacementOption === option.label);
      if (selectedOption) {
        const blob = await createBlob(selectedOption);
        logger.info(`Video filter changed to Replacement - ${selectedOption.label}`);
        await changeBackgroundReplacementImage(blob);
        setBackgroundReplacementOption(replacementOption); 
      } else {
        logger.error(`Error: Cannot find ${replacementOption} in the replacementOptionsList: ${replacementOptionsList}`);
      }
    } catch (error) {
      logger.error(`Error trying to change background replacement image ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = async (deviceId: string): Promise<void> => {
      try {
        // If background blur/replacement is on, then re-use the same video transform pipeline, but replace the inner device
        // If background blur/replacement is not on, then do a normal video selection
        let newDevice: VideoInputDevice = deviceId;
        if (isVideoTransformDevice(selectedDevice) && !isLoading) {
          setIsLoading(true);
          if ('chooseNewInnerDevice' in selectedDevice) {
            // @ts-ignore
            newDevice = selectedDevice.chooseNewInnerDevice(deviceId);
          } else {
            logger.error('Transform device cannot choose new inner device');
            return;
          }
        }
        if (isVideoEnabled) {
          await meetingManager.startVideoInputDevice(newDevice);
        } else {
          meetingManager.selectVideoInputDevice(newDevice);
        }
      } catch (error) {
        logger.error('VideoInputTransformControl failed to select video input device');
      } finally {
        setIsLoading(false);
      }
    };

    const getDropdownWithVideoTransformOptions = async (): Promise<void> => {
      const deviceOptions: ReactNode[] = await Promise.all(videoDevices.map(async (option) => (
        <PopOverItem
          key={option.deviceId}
          checked={await isOptionActive(selectedDevice, option.deviceId)}
          onClick={async () => await handleClick(option.deviceId)}
        >
          <span>{option.label}</span>
        </PopOverItem>
      )));

      // Add 'Enable Background Blur' to the selection dropdown as an option if it's offered/supported.
      if (isBackgroundBlurSupported) {
        const videoTransformOptions: ReactNode = (
          <PopOverItem
            key="backgroundBlurFilter"
            checked={activeVideoTransformOption === VideoTransformOptions.Blur}
            disabled={isLoading}
            onClick={toggleBackgroundBlur}
          >
            <>
              {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
              {backgroundBlurLabel}
            </>
          </PopOverItem>
        );
        deviceOptions.push(<PopOverSeparator key="separator1" />);
        deviceOptions.push(videoTransformOptions);
      }

      // Add 'Enable Background Replacement' to the selection dropdown as an option if it's offered/supported.
      if (isBackgroundReplacementSupported) {
        const videoTransformOptions: ReactNode = (
          <PopOverItem
            key="backgroundReplacementFilter"
            checked={activeVideoTransformOption === VideoTransformOptions.Replacement}
            disabled={isLoading}
            onClick={toggleBackgroundReplacement}
          >
            <>
              {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
              {backgroundReplacementLabel}
            </>
          </PopOverItem>
        );
        deviceOptions.push(<PopOverSeparator key="separator2" />);
        deviceOptions.push(videoTransformOptions);
      }

      // Add 'Select Background Replacement Filter' to the selection dropdown as an option if it's offered/supported.
      if (isBackgroundReplacementSupported && backgroundReplacementProcessor) {
        const replacementOptions: ReactNode = (
          <PopOverSubMenu
            key="backgrounReplacementFilterList"
            text="Select Background Replacement Filter"
          >
            <PopOverItem
              key="backgroundReplacementBlue"
              checked={backgroundReplacementOption === ReplacementOptions.Blue}
              disabled={isLoading}
              onClick={async () => await changeBackgroundReplacementOption(ReplacementOptions.Blue)}
            >
              <>
                {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
                {ReplacementOptions.Blue}
              </>
            </PopOverItem>
            <PopOverItem
              key="backgroundReplacementBeach"
              checked={backgroundReplacementOption === ReplacementOptions.Beach}
              disabled={isLoading}
              onClick={async () => await changeBackgroundReplacementOption(ReplacementOptions.Beach)}
            >
              <>
                {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
                {ReplacementOptions.Beach}
              </>
            </PopOverItem>
          </PopOverSubMenu>
        );
        deviceOptions.push(<PopOverSeparator key="separator3" />);
        deviceOptions.push(replacementOptions);
      }
      setDropdownWithVideoTransformOptions(deviceOptions);
    };

    getDropdownWithVideoTransformOptions();
  }, [
    createBackgroundBlurDevice,
    createBackgroundReplacementDevice,
    meetingManager,
    meetingManager.startVideoInputDevice,
    videoDevices,
    isLoading,
    isVideoEnabled,
    selectedDevice,
    isBackgroundBlurSupported,
    isBackgroundReplacementSupported,
  ]);

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleVideo}
      label={label}
    >
      {dropdownWithVideoTransformOptions}
    </ControlBarButton>
  );
};

export default VideoInputTransformControl;
