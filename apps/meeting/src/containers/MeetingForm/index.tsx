// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  DeviceLabels,
  Flex,
  FormField,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
  useMeetingManager,
} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

import { getErrorContext } from '../../providers/ErrorProvider';
import routes from '../../constants/routes';
import Card from '../../components/Card';
import Spinner from '../../components/icons/Spinner';
import DevicePermissionPrompt from '../DevicePermissionPrompt';
import { createGetAttendeeCallback, fetchMeeting } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { MeetingMode, VideoFiltersCpuUtilization } from '../../types';
import { MeetingManagerJoinOptions } from 'amazon-chime-sdk-component-library-react/lib/providers/MeetingProvider/types';
import meetingConfig from '../../meetingConfig';
import { SetToLocalStorage } from '../../utils/helpers/localStorageHelper';
import { LOCAL_STORAGE_ITEM_KEYS, USER_TYPES } from '../../utils/enums';
import { ExtractMeetingIdAndUsernameFromURL } from '../../utils/helpers';
import { MeetingObject } from '../../utils/interfaces';

const MeetingForm: React.FC = () => {
  const meetingManager = useMeetingManager();
  const {
    region,
    meetingId,
    localUserName,
    meetingMode,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    isWebAudioEnabled,
    isEchoReductionEnabled,
    joineeType,
    setJoinInfo,
    setMeetingMode,
    setMeetingId,
    setLocalUserName,
    setRegion,
    setCpuUtilization,
    setMeetingJoined,
    setJoineeType
  } = useAppState();
  const [meetingErr, setMeetingErr] = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const [localPassword, setLocalPassword] = useState<string>("");

  const [isMeetingIdEditable, setIsMeetingIdEditable] = useState<boolean>(true);
  const [isUsernameEditable, setIsUsernameEditable] = useState<boolean>(true);

  const history = useHistory();

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = meetingId.trim().toLocaleLowerCase();
    const attendeeName = localUserName.trim();

    if (!id || !attendeeName) {
      if (!attendeeName) {
        setNameErr(true);
      }
      if (!id) {
        setMeetingErr(true);
      }
      return;
    }

    setIsLoading(true);
    meetingManager.getAttendee = createGetAttendeeCallback(id);

    try {
      const { JoinInfo } = await fetchMeeting(id, attendeeName, region, isEchoReductionEnabled);
      setJoinInfo(JoinInfo);
      SetToLocalStorage(LOCAL_STORAGE_ITEM_KEYS.JOIN_INFO, {JoinInfo, localInfo: {id, attendeeName, region, joineeType}});
      const meetingSessionConfiguration = new MeetingSessionConfiguration(JoinInfo?.Meeting, JoinInfo?.Attendee);
      if (
        meetingConfig.postLogger &&
        meetingSessionConfiguration.meetingId &&
        meetingSessionConfiguration.credentials &&
        meetingSessionConfiguration.credentials.attendeeId
      ) {
        const existingMetadata = meetingConfig.postLogger.metadata;
        meetingConfig.postLogger.metadata = {
          ...existingMetadata,
          meetingId: meetingSessionConfiguration.meetingId,
          attendeeId: meetingSessionConfiguration.credentials.attendeeId,
        };
      }

      setRegion(JoinInfo.Meeting.MediaRegion);
      meetingSessionConfiguration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = enableSimulcast;
      if (priorityBasedPolicy) {
        meetingSessionConfiguration.videoDownlinkBandwidthPolicy = priorityBasedPolicy;
      }
      meetingSessionConfiguration.keepLastFrameWhenPaused = keepLastFrameWhenPaused;
      const options: MeetingManagerJoinOptions = {
        deviceLabels: meetingMode === MeetingMode.Spectator ? DeviceLabels.None : DeviceLabels.AudioAndVideo,
        enableWebAudio: isWebAudioEnabled,
      };

      await meetingManager.join(meetingSessionConfiguration, options);
      if (meetingMode === MeetingMode.Spectator) {
        setMeetingJoined(true);
        SetToLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_JOINED, "true");
        await meetingManager.start();
        history.push(`${routes.HOME}/${meetingId}`);
      } else {
        setMeetingMode(MeetingMode.Attendee);
        history.push(`${routes.DEVICE}`);
      }
    } catch (error) {
      updateErrorMessage((error as Error).message);
    }
  };

  const closeError = (): void => {
    updateErrorMessage('');
    setMeetingId('');
    setLocalUserName('');
    setIsLoading(false);
  };

  const setupRegion = async (): Promise<void> => {
    try {
      const res = await fetch('https://nearest-media-region.l.chime.aws', {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      const nearestRegion = data.region;
      setRegion((region: string) => region || nearestRegion);
    } catch (e) {
      console.error('Could not fetch nearest region: ', (e as Error).message);
    }
  }

  const setupVideoFilterCpuUtilization = (): void => {
    setCpuUtilization(VideoFiltersCpuUtilization.CPU10Percent);
  }

  const setupForm = (): void => {
    const meetingObjectFromURL : MeetingObject = ExtractMeetingIdAndUsernameFromURL(window.location.href);
    if(meetingObjectFromURL?.meetingId){
      setMeetingId(meetingObjectFromURL.meetingId);
      setIsMeetingIdEditable(false);
    }
    if(meetingObjectFromURL?.userName){
      setLocalUserName(meetingObjectFromURL.meetingId);
      setIsUsernameEditable(false);
    }
    // If we get a usertype from url then make it the current user type
    // or set the usertype to student as default
    if(meetingObjectFromURL?.userType){
      setJoineeType(meetingObjectFromURL.userType);
    } else {
      setJoineeType(USER_TYPES.STUDENT);
    }
    // replacing the url to hide query params and just keep the meeting id
    window.history.replaceState(null, "", `/meeting/${meetingObjectFromURL.meetingId}`);
  }

  const init = (): void => {
    setupRegion();
    setupVideoFilterCpuUtilization();
    setupForm();
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <form>
      <Heading tag="h1" level={4} css="text-align: center">
        SplashLiv
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 3rem; text-align: center">
        Join a meeting
      </Heading>
      <FormField
        field={Input}
        label="Meeting Id"
        value={meetingId}
        infoText="Anyone with access to the meeting ID can join"
        fieldProps={{
          name: 'meetingId',
          placeholder: 'Enter Meeting Id',
        }}
        errorText="Please enter a valid meeting ID"
        error={meetingErr}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          if (isMeetingIdEditable) setMeetingId(e.target.value);
          if (meetingErr) {
            setMeetingErr(false);
          }
        }}
      />
      <FormField
        field={Input}
        label="Name"
        value={localUserName}
        fieldProps={{
          name: 'name',
          placeholder: 'Enter Your Name',
        }}
        errorText="Please enter a valid name"
        error={nameErr}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          if (isUsernameEditable) setLocalUserName(e.target.value);
          if (nameErr) {
            setNameErr(false);
          }
        }}
      />
      <FormField
        field={Input}
        label="Password"
        value={localPassword}
        fieldProps={{
          name: 'name',
          placeholder: 'Enter Your Password',
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setLocalPassword(e.target.value);
        }}
      />
      <Flex container layout="fill-space-centered" style={{ marginTop: '2.5rem' }}>
        {isLoading ? <Spinner /> : <PrimaryButton label="Continue" onClick={handleJoinMeeting} />}
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
  );
};

export default MeetingForm;
