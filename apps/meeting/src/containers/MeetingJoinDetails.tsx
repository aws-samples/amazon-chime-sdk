// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  PrimaryButton,
  Flex,
  Label,
} from 'amazon-chime-sdk-component-library-react';
import { useAppState } from '../providers/AppStateProvider';

const MeetingJoinDetails = () => {
  const history = useHistory();
  const { meetingId, localUserName } = useAppState();

  const handleJoinLobby = async () => {
    history.push(`/meeting/${meetingId}/lobby`);
  };

  return (
    <>
      <Flex container alignItems="center" flexDirection="column">
        <PrimaryButton
          label={'Join lobby'}
          onClick={handleJoinLobby}
        />
        <Label style={{ margin: '.75rem 0 0 0' }}>
          Joining meeting <b>{meetingId}</b> as <b>{localUserName}</b>
        </Label>
      </Flex>
    </>
  );
};

export default MeetingJoinDetails;
