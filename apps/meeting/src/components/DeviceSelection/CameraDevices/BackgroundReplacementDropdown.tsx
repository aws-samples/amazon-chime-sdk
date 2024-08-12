// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useState } from 'react';
import {
  useBackgroundReplacement,
  FormField,
  Select,
  useVideoInputs,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { createBlob } from '../../../utils/background-replacement';
import { useAppState } from '../../../providers/AppStateProvider';

interface Props {
  /* Title for the dropdown, defaults to `Background Replacement Dropdown` */
  label?: string;
}

export const BackgroundReplacementDropdown: React.FC<Props> = ({
  label = 'Background Replacement Dropdown',
}) => {
  const { selectedDevice } = useVideoInputs();
  const { backgroundReplacementOption, setBackgroundReplacementOption, replacementOptionsList } = useAppState();
  const { isBackgroundReplacementSupported, changeBackgroundReplacementImage } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const logger = useLogger();

  // Creates a image blob on the selections (Blue, Beach) and changes the background image.
  const selectReplacement = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectReplacement = e.target.value;
    let currentDevice = selectedDevice;

    if (isLoading || currentDevice === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      const selectedOption = replacementOptionsList.find(option => selectReplacement === option.value);
      if (selectedOption) {
        const blob = await createBlob(selectedOption);
        logger.info(`Video filter changed to Replacement - ${selectedOption.label}`);
        await changeBackgroundReplacementImage(blob);
        setBackgroundReplacementOption(selectedOption.label); 
      } else {
        logger.error(`Error: Cannot find ${selectReplacement} in the replacementOptionsList: ${replacementOptionsList}`);
      }
    } catch (e) {
      logger.error(`Error trying to apply ${selectReplacement}: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {isBackgroundReplacementSupported ? (
      <FormField
        field={Select}
        options={replacementOptionsList}
        onChange={selectReplacement}
        value={backgroundReplacementOption}
        label={label}
      />
    ) : ''}
  </>
  );
};

export default BackgroundReplacementDropdown;
