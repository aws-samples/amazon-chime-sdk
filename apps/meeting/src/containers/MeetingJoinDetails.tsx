// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PrimaryButton,
  Flex,
  Label,
  useMeetingManager,
  Modal,
  ModalBody,
  ModalHeader,
  DeviceLabels,
  MeetingManagerJoinOptions,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

import routes from '../constants/routes';
import Card from '../components/Card';
import { useAppState } from '../providers/AppStateProvider';

const MeetingJoinDetails = () => {
  const meetingManager = useMeetingManager();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { meetingId, localUserName, isPreMeetingDeviceSetupAllowed, joinInfo, isVoiceFocusEnabled, skipDeviceSelection } =
    useAppState();

  const handleJoinMeeting = async () => {
    setIsLoading(true);

    try {
      if (isPreMeetingDeviceSetupAllowed) {
        const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo!.Meeting, joinInfo!.Attendee);
        const options: MeetingManagerJoinOptions = {
          deviceLabels: DeviceLabels.AudioAndVideo,
          enableWebAudio: isVoiceFocusEnabled,
          skipDeviceSelection,
        };
        await meetingManager.join(meetingSessionConfiguration as any, options);
      }

      await meetingManager.start();
      setIsLoading(false);
      navigate(`${routes.MEETING}/${meetingId}`);
    } catch (error) {
      setIsLoading(false);
      setError((error as Error).message);
    }
  };

  return (
    <>
      <Flex container alignItems="center" flexDirection="column">
        <PrimaryButton
          label={isLoading ? 'Loading...' : 'Join meeting'}
          onClick={handleJoinMeeting}
        />
        <Label style={{ margin: '.75rem 0 0 0' }}>
          Joining meeting <b>{meetingId}</b> as <b>{localUserName}</b>
        </Label>
      </Flex>
      {error && (
        <Modal size="md" onClose={(): void => setError('')}>
          <ModalHeader title={`Meeting ID: ${meetingId}`} />
          <ModalBody>
            <Card
              title="Unable to join meeting"
              description="There was an issue in joining this meeting. Check your connectivity and try again."
              smallText={error}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default MeetingJoinDetails;
