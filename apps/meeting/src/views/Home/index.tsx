// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useContext, useEffect } from "react";

import MeetingFormSelector from "../../containers/MeetingFormSelector";
import { StyledLayout } from "./Styled";
import { VersionLabel } from "../../utils/VersionLabel";
import { useAppState } from "../../providers/AppStateProvider";
import { Meeting } from "../../views";
import NoMeetingRedirect from "../../containers/NoMeetingRedirect";
import { GetFromLocalStorage } from "../../utils/helpers/localStorageHelper";
import { LOCAL_STORAGE_ITEM_KEYS } from "../../utils/enums";
import meetingConfig from "../../meetingConfig";
import { MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import {
  DeviceLabels,
  MeetingManagerJoinOptions,
  Modal,
  ModalBody,
  ModalHeader,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";
import { MeetingMode } from "../../types";
import { useHistory } from "react-router-dom";
import { getErrorContext } from "../../providers/ErrorProvider";
import Card from "../../components/Card";
import { IsMeetingObjectPresentInLocalStorage } from "../../utils/helpers";
import { createGetAttendeeCallback } from "../../utils/api";

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

const Home = () => {

  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const {
    meetingId,
    meetingMode,
    enableSimulcast,
    priorityBasedPolicy,
    keepLastFrameWhenPaused,
    isWebAudioEnabled,
    meetingJoined,
    setJoinInfo,
    setMeetingMode,
    setRegion,
    setMeetingJoined,
    setMeetingId,
    setLocalUserName,
    setJoineeType
  } = useAppState();

  const meetingManager = useMeetingManager();
  const history = useHistory();

  const loadMeetingFromLocalStorage = async (): Promise<void> => {
    
    const meetingJoinedFromLocalStorage = GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_JOINED) ? true : false;
    const {JoinInfo, localInfo, slMeet, participant} = GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.JOIN_INFO) || {}

    if (
      meetingJoinedFromLocalStorage &&
      JoinInfo?.Meeting?.MeetingId
    ) {
      try {
        meetingManager.getAttendee = createGetAttendeeCallback(slMeet.slug, participant.token);
        setJoineeType(participant?.userType);
        setLocalUserName(localInfo?.attendeeName);
        setRegion(localInfo?.region);
        setMeetingId(slMeet?.slug);
        setJoinInfo(JoinInfo);
        const meetingSessionConfiguration = new MeetingSessionConfiguration(
          JoinInfo?.Meeting,
          JoinInfo?.Attendee
        );
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
          deviceLabels:
            meetingMode === MeetingMode.Spectator
              ? DeviceLabels.None
              : DeviceLabels.AudioAndVideo,
          enableWebAudio: isWebAudioEnabled,
        };

        await meetingManager.join(meetingSessionConfiguration, options);
        if (meetingMode === MeetingMode.Spectator) {
          setMeetingJoined(true);
          await meetingManager.start();
          history.replace(`/meeting/${localInfo?.id}`);
        } else {
          setMeetingMode(MeetingMode.Attendee);
          setMeetingJoined(true);
          await meetingManager.start();
          history.replace(`/meeting/${localInfo?.id}`);
        }
      } catch (error) {
        updateErrorMessage((error as Error).message);
      }
    }
  };

  const closeError = (): void => {
    updateErrorMessage("");
    setMeetingId("");
    setLocalUserName("");
  };

  useEffect(() => {
    if(!meetingJoined && IsMeetingObjectPresentInLocalStorage())
      loadMeetingFromLocalStorage();
  }, []);

  const componentToRender = meetingJoined ? (
    <NoMeetingRedirect>
      <MeetingModeSelector />
    </NoMeetingRedirect>
  ) : (
    <StyledLayout>
      <MeetingFormSelector />
      <VersionLabel />
    </StyledLayout>
  );

  return (
    <>
      {componentToRender}
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
    </>
  );
};

export default Home;
