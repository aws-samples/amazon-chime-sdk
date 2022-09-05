// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ControlBarButton,
  ScreenShare,
  useContentShareControls,
  useContentShareState,
} from "amazon-chime-sdk-component-library-react";
import { BaseSdkProps } from "amazon-chime-sdk-component-library-react/lib/components/sdk/Base";
import { PopOverItemProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/PopOver/PopOverItem";
import React, { useState } from "react";
import { useAppState } from "../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../utils/enums";

interface Props extends BaseSdkProps {
  /** The label that will be shown for content share control, it defaults to `Content`. */
  label?: string;
  /** The label that will be shown for pausing content share button in content share control, it defaults to `Pause`. */
  pauseLabel?: string;
  /** The label that will be shown for unpausing content share button in content share control, it defaults to `Unpause`. */
  unpauseLabel?: string;
  /** Title attribute for the icon, it defaults to `Screen share`. */
  iconTitle?: string;
}

const CustomContentShareControl: React.FC<Props> = ({
  label = "Content",
  pauseLabel = "Pause",
  unpauseLabel = "Unpause",
  iconTitle,
  ...rest
}) => {
  const { isLocalUserSharing } = useContentShareState();
  const {
    paused,
    toggleContentShare,
    togglePauseContentShare,
  } = useContentShareControls();
  const { joineeType } = useAppState();
  const [
    studentHasPermissionToShareContent,
    setStudentHasPermissionToShareContent,
  ] = useState<boolean>(false);

  const toggleIfAllowed = () => {
    if (joineeType === USER_TYPES.STUDENT) {
      if (studentHasPermissionToShareContent) {
        toggleContentShare();
      } else {
        alert("You don't have permission for this.");
      }
    } else {
      toggleContentShare();
    }
    //Just to avoid webpack error, does nothing, sets current value as current value
    setStudentHasPermissionToShareContent((currentValue) => currentValue);
  };

  const dropdownOptions: PopOverItemProps[] = [
    {
      children: <span>{paused ? unpauseLabel : pauseLabel}</span>,
      onClick: togglePauseContentShare,
    },
  ];

  return (
    <ControlBarButton
      icon={<ScreenShare title={iconTitle} />}
      onClick={toggleIfAllowed}
      label={label}
      popOver={isLocalUserSharing ? dropdownOptions : null}
      {...rest}
    />
  );
};

export default CustomContentShareControl;
