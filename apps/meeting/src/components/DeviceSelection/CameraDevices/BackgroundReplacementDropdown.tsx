// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useState } from 'react';
import {
  useBackgroundReplacement,
  FormField,
  Select,
  useVideoInputs,
} from 'amazon-chime-sdk-component-library-react';
import { BackgroundImageEncoding, createColorBlob, createImageBlob } from '../../../utils/image';
import { ReplacementDropdownOptionType, ReplacementOptions } from '../../../types/index';
import { useAppState } from '../../../providers/AppStateProvider';

interface Props {
  /* Title for the dropdown, defaults to `Background Replacement Dropdown` */
  label?: string;
}

export const BackgroundReplacementDropdown: React.FC<Props> = ({
  label = 'Background Replacement Dropdown',
}) => {
  const { selectedDevice } = useVideoInputs();
  const { backgroundReplacementOption, setBackgroundReplacementOption } = useAppState();
  const { isBackgroundReplacementSupported, changeBackgroundReplacementImage } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);

  const options: ReplacementDropdownOptionType[] = [
    {
      label: ReplacementOptions.Blue,
      value: isBackgroundReplacementSupported === undefined || isBackgroundReplacementSupported === false ? 'Background Replacement not supported' :ReplacementOptions.Blue,
    },
    {
      label: ReplacementOptions.Beach,
      value: isBackgroundReplacementSupported === undefined || isBackgroundReplacementSupported === false ? 'Background Replacement not supported' :ReplacementOptions.Beach,
    },
  ];

  // Creates a image blob on the selections (Blue, Beach) and changes the background image.
  const selectReplacement = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectReplacement = e.target.value;
    let currentDevice = selectedDevice;

    if (isLoading || currentDevice === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      if (selectReplacement === ReplacementOptions.Blue && isBackgroundReplacementSupported) {
        const blob = await createColorBlob();
        await changeBackgroundReplacementImage(blob);
        console.info(`Video filter changed to Relacement - Blue`);
      } else if (selectReplacement === ReplacementOptions.Beach && isBackgroundReplacementSupported) {
        const imageInBase64 = BackgroundImageEncoding();
        const blob = await createImageBlob(imageInBase64);
        await changeBackgroundReplacementImage(blob);
        console.info(`Video filter changed to Relacement - Beach`);
      }      
      // Update the current selected transform.
      setBackgroundReplacementOption(selectReplacement);  
    } catch (e) {
      console.error('Error trying to apply', selectReplacement, e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormField
      field={Select}
      options={options}
      onChange={selectReplacement}
      value={backgroundReplacementOption}
      label={label}
    />
  );
};

export default BackgroundReplacementDropdown;
