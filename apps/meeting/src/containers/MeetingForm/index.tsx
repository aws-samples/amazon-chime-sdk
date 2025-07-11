// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { ChangeEvent, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Checkbox,
  DeviceLabels,
  Flex,
  FormField,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
  Select,
  useMeetingManager,
  useVoiceFocus,
} from 'amazon-chime-sdk-component-library-react';
import { DefaultBrowserBehavior, MeetingSessionConfiguration } from 'amazon-chime-sdk-js';

import { getErrorContext } from '../../providers/ErrorProvider';
import routes from '../../constants/routes';
import Card from '../../components/Card';
import Spinner from '../../components/icons/Spinner';
import DevicePermissionPrompt from '../DevicePermissionPrompt';
import RegionSelection from './RegionSelection';
import { createGetAttendeeCallback, createMeetingAndAttendee, JoinMeetingInfo } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';
import { MeetingMode, VideoFiltersCpuUtilization } from '../../types';
import { MeetingManagerJoinOptions } from 'amazon-chime-sdk-component-library-react/lib/providers/MeetingProvider/types';
import meetingConfig from '../../meetingConfig';

const VIDEO_TRANSFORM_FILTER_OPTIONS = [
  { value: VideoFiltersCpuUtilization.Disabled, label: 'Disable Video Filter' },
  { value: VideoFiltersCpuUtilization.CPU10Percent, label: 'Video Filter CPU 10%' },
  { value: VideoFiltersCpuUtilization.CPU20Percent, label: 'Video Filter CPU 20%' },
  { value: VideoFiltersCpuUtilization.CPU40Percent, label: 'Video Filter CPU 40%' },
];

const MeetingForm: React.FC = () => {
  const meetingManager = useMeetingManager();
  const { isVoiceFocusSupported } = useVoiceFocus();
  const {
    region,
    meetingId,
    localUserName,
    meetingMode,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    videoTransformCpuUtilization: videoTransformCpuUtilization,
    setJoinInfo,
    joinInfo,
    isEchoReductionEnabled,
    isVoiceFocusDesired,
    enableMaxContentShares,
    toggleSimulcast,
    togglePriorityBasedPolicy,
    toggleKeepLastFrameWhenPaused,
    toggleMaxContentShares,
    setMeetingMode,
    setMeetingId,
    setLocalUserName,
    setRegion,
    setCpuUtilization,
    skipDeviceSelection,
    toggleVoiceFocusDesired,
    toggleEchoReduction,
    setIsVoiceFocusEnabled,
    toggleMeetingJoinDeviceSelection,
  } = useAppState();
  const [meetingErr, setMeetingErr] = useState(false);
  const [nameErr, setNameErr] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldJoinAfterCheck, setShouldJoinAfterCheck] = useState(false);
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const navigate = useNavigate();
  const browserBehavior = new DefaultBrowserBehavior();

  // Join meeting when Voice Focus support check completes
  useEffect(() => {
    if (shouldJoinAfterCheck && isVoiceFocusSupported !== undefined && joinInfo) {
      setShouldJoinAfterCheck(false);
      joinMeeting(joinInfo);
    }
  }, [isVoiceFocusSupported, shouldJoinAfterCheck, joinInfo]);

  const validateInput = (id: string, attendeeName: string): boolean => {
    let isValid = true;

    if (!attendeeName) {
      setNameErr(true);
      isValid = false;
    }

    if (!id) {
      setMeetingErr(true);
      isValid = false;
    }

    return isValid;
  };

  const createMeetingAndAttendeeResponse = async (
    id: string,
    attendeeName: string
  ): Promise<JoinMeetingInfo | null> => {
    try {
      const { JoinInfo } = await createMeetingAndAttendee(id, attendeeName, region, isEchoReductionEnabled);
      setJoinInfo(JoinInfo); // This will trigger VF support check in VoiceFocusProvider
      return JoinInfo;
    } catch (error) {
      updateErrorMessage((error as Error).message);
      setIsLoading(false);
      return null;
    }
  };

  const joinMeeting = async (joinInfo: JoinMeetingInfo): Promise<void> => {
    try {
      const meetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo?.Meeting, joinInfo?.Attendee);
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

      setRegion(joinInfo!.Meeting.MediaRegion);
      meetingSessionConfiguration.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = enableSimulcast;
      if (priorityBasedPolicy) {
        meetingSessionConfiguration.videoDownlinkBandwidthPolicy = priorityBasedPolicy;
      }
      meetingSessionConfiguration.keepLastFrameWhenPaused = keepLastFrameWhenPaused;

      // Enable Voice Focus when user has desire to enable it and Voice Focus is supported
      const isVoiceFocusEnabled = isVoiceFocusDesired && isVoiceFocusSupported === true;
      setIsVoiceFocusEnabled(isVoiceFocusEnabled);

      const options: MeetingManagerJoinOptions = {
        deviceLabels: meetingMode === MeetingMode.Spectator ? DeviceLabels.None : DeviceLabels.AudioAndVideo,
        enableWebAudio: isVoiceFocusEnabled,
        skipDeviceSelection,
      };
      await meetingManager.join(meetingSessionConfiguration as any, options);

      if (meetingMode === MeetingMode.Spectator) {
        await meetingManager.start();
        navigate(`${routes.MEETING}/${meetingId}`);
      } else {
        setMeetingMode(MeetingMode.Attendee);
        navigate(routes.DEVICE);
      }
      setIsLoading(false);
    } catch (error) {
      updateErrorMessage((error as Error).message);
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = meetingId.trim().toLocaleLowerCase();
    const attendeeName = localUserName.trim();

    if (!validateInput(id, attendeeName)) {
      return;
    }

    setIsLoading(true);
    meetingManager.getAttendee = createGetAttendeeCallback(id);

    const joinInfo = await createMeetingAndAttendeeResponse(id, attendeeName);
    if (!joinInfo) return;

    if (isVoiceFocusDesired && isVoiceFocusSupported === undefined) {
      // Wait for Voice Focus support check
      setShouldJoinAfterCheck(true);
      return;
    }

    // Join meeting if Voice Focus is not desired or Voice Focus support check is completed
    await joinMeeting(joinInfo);
  };

  const closeError = (): void => {
    updateErrorMessage('');
    setMeetingId('');
    setLocalUserName('');
    setIsLoading(false);
  };

  return (
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
          placeholder: 'Enter Meeting Id',
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
        value={localUserName}
        fieldProps={{
          name: 'name',
          placeholder: 'Enter Your Name',
        }}
        errorText="Please enter a valid name"
        error={nameErr}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setLocalUserName(e.target.value);
          if (nameErr) {
            setNameErr(false);
          }
        }}
      />
      <RegionSelection setRegion={setRegion} region={region} />
      <FormField
        field={Checkbox}
        label="Join w/o Audio and Video (spectator mode)"
        value=""
        checked={meetingMode === MeetingMode.Spectator}
        onChange={(): void => {
          if (meetingMode === MeetingMode.Spectator) {
            setMeetingMode(MeetingMode.Attendee);
          } else {
            setMeetingMode(MeetingMode.Spectator);
          }
        }}
      />
      <FormField
        field={Checkbox}
        label="Enable Voice Focus"
        value=""
        checked={isVoiceFocusDesired}
        onChange={toggleVoiceFocusDesired}
        infoText="Reduce background noise during calls"
      />
      {/* Amazon Chime Echo Reduction is a premium feature, please refer to the Pricing page for details.*/}
      {isVoiceFocusDesired && (
        <FormField
          field={Checkbox}
          label="Enable Echo Reduction"
          value=""
          checked={isEchoReductionEnabled}
          onChange={toggleEchoReduction}
          infoText="Enable Echo Reduction (new meetings only)"
        />
      )}
      {/* BlurSelection */}
      {/* Background Video Transform Selections */}
      <FormField
        field={Select}
        options={VIDEO_TRANSFORM_FILTER_OPTIONS}
        onChange={(e: ChangeEvent<HTMLSelectElement>): void => {
          setCpuUtilization(e.target.value);
        }}
        value={videoTransformCpuUtilization}
        label="Background Filters CPU Utilization"
      />
      {/* Video uplink and downlink policies */}
      {browserBehavior.isSimulcastSupported() && (
        <FormField
          field={Checkbox}
          label="Enable Simulcast"
          value=""
          checked={enableSimulcast}
          onChange={toggleSimulcast}
        />
      )}

      {browserBehavior.supportDownlinkBandwidthEstimation() && (
        <FormField
          field={Checkbox}
          label="Use Priority-Based Downlink Policy"
          value=""
          checked={priorityBasedPolicy !== undefined}
          onChange={togglePriorityBasedPolicy}
        />
      )}
      <FormField
        field={Checkbox}
        label="Keep Last Frame When Paused"
        value=""
        checked={keepLastFrameWhenPaused}
        onChange={toggleKeepLastFrameWhenPaused}
      />
      <FormField
        field={Checkbox}
        label="Skip Meeting Join Device Selection"
        value=""
        checked={skipDeviceSelection}
        onChange={toggleMeetingJoinDeviceSelection}
        infoText="Please select the devices manually to successfully join a meeting"
      />
      <FormField
        field={Checkbox}
        label="Enable Multiple Content Shares (max: 2)"
        value=""
        checked={enableMaxContentShares}
        onChange={toggleMaxContentShares}
        infoText="Allow up to 2 simultaneous content shares in the meeting"
      />
      <Flex container layout="fill-space-centered" style={{ marginTop: '2.5rem' }}>
        {isLoading ? <Spinner /> : <PrimaryButton label="Continue" onClick={handleJoinMeeting} disabled={isLoading} />}
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
