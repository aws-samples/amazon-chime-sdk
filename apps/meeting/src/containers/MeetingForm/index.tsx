// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useContext, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Input,
  Flex,
  Heading,
  FormField,
  PrimaryButton,
  useMeetingManager,
  Modal,
  ModalBody,
  ModalHeader,
  DeviceLabels,
} from 'amazon-chime-sdk-component-library-react';

import { getErrorContext } from '../../providers/ErrorProvider';
import routes from '../../constants/routes';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import DevicePermissionPrompt from '../DevicePermissionPrompt';
import RegionSelection from './RegionSelection';
import { fetchMeeting, createGetAttendeeCallback } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { StyledDiv, StyledWrapper } from './Styled';

const MeetingForm: React.FC = () => {
  const meetingManager = useMeetingManager();
  const {
    setAppMeetingInfo,
    region: appRegion,
    meetingId: appMeetingId
  } = useAppState();
  const [meetingId, setMeetingId] = useState(appMeetingId);
  const [meetingErr, setMeetingErr] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [region, setRegion] = useState(appRegion);
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const history = useHistory();

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = meetingId.trim().toLocaleLowerCase();
    const attendeeName = name.trim();

    setIsLoading(true);
    meetingManager.getAttendee = createGetAttendeeCallback(id);

    const { JoinInfo } = await fetchMeeting(id, attendeeName, region);

    await meetingManager.join({
      meetingInfo: JoinInfo.Meeting,
      attendeeInfo: JoinInfo.Attendee,
      deviceLabels: DeviceLabels.AudioAndVideo,
    });

    setAppMeetingInfo(id, attendeeName, region);
    await meetingManager.start();
    history.push(`${routes.MEETING}/${meetingId}`);
  };

  const closeError = (): void => {
    updateErrorMessage('');
    setMeetingId('');
    setName('');
    setIsLoading(false);
  };

  return (
    <StyledWrapper>
      <StyledDiv>
        <form>
          <Heading tag="h1" level={4} css="margin-bottom: 1rem">
            Join a meeting
          </Heading>
          <FormField
            field={Input}
            label="Meeting Id"
            value={meetingId}
            infoText="Anyone with access to the meeting ID can join"
            fieldProps={{
              name: 'meetingId',
              placeholder: 'Enter Meeting Id'
            }}
            errorText="Please enter a valid meeting ID"
            error={meetingErr}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setMeetingId(e.target.value);
              if (meetingErr) {
                setMeetingErr(false);
              }
            }}
          />
          <FormField
            field={Input}
            label="Name"
            value={name}
            fieldProps={{
              name: 'name',
              placeholder: 'Enter Your Name'
            }}
            errorText="Please enter a valid name"
            error={nameErr}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setName(e.target.value);
              if (nameErr) {
                setNameErr(false);
              }
            }}
          />
          <RegionSelection setRegion={setRegion} region={region} />
          <Flex
            container
            layout="fill-space-centered"
            style={{ marginTop: '2.5rem' }}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <PrimaryButton label="Continue" onClick={handleJoinMeeting} />
            )}
          </Flex>
          {errorMessage && (
            <Modal size="md" onClose={closeError}>
              <ModalHeader title={`Meeting ID: ${meetingId}`} />
              <ModalBody>
                <Card
                  title="Unable to join meeting"
                  description="There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired."
                  smallText={errorMessage}
                />
              </ModalBody>
            </Modal>
          )}
          <DevicePermissionPrompt />
        </form>
      </StyledDiv>
    </StyledWrapper>
  );
};

export default MeetingForm;
