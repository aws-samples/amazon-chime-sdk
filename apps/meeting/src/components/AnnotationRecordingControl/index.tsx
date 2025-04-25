// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, ReactNode } from 'react';
import { ControlBarButton, Camera, useLogger, PopOverItem } from 'amazon-chime-sdk-component-library-react';
import {
  DefaultMeetingSession,
  ConsoleLogger,
  LogLevel,
  MeetingSessionConfiguration,
  DefaultDeviceController,
} from 'amazon-chime-sdk-js';
import { createMeetingAndAttendee } from '../../utils/api';
import { useAppState } from '../../providers/AppStateProvider';

const AnnotationRecordingControl: React.FC = () => {
  const logger = useLogger();
  const { meetingId, region, showAnnotatedContentShare, toggleAnnotatedContentShare } = useAppState();
  const [isRecording, setIsRecording] = useState(false);
  const [recorderSession, setRecorderSession] = useState<DefaultMeetingSession | null>(null);

  const createAttendeeAndJoinMeeting = async () => {
    try {
      // 1. Create a new attendee for recording
      logger.debug('Creating recorder attendee');
      const response = await createMeetingAndAttendee(
        meetingId.trim().toLocaleLowerCase(),
        'Annotation-Recorder',
        region
      );

      // 2. Create a meeting session for the recorder
      const configuration = new MeetingSessionConfiguration(response.JoinInfo.Meeting, response.JoinInfo.Attendee);

      const recorderLogger = new ConsoleLogger('RecorderLogger', LogLevel.INFO);
      const deviceController = new DefaultDeviceController(recorderLogger);

      const meetingSession = new DefaultMeetingSession(configuration, recorderLogger, deviceController);
      logger.debug('Meeting session created');

      setRecorderSession(meetingSession);

      // 3. Join the meeting
      await meetingSession.audioVideo.start();

      logger.debug('Recorder joined meeting');
    } catch (error) {
      // @ts-ignore
      logger.error(`Failed to create attendee and join meeting: ${error?.message || error}`);
      console.error('Join meeting error:', error);
    }
  };

  const recorderAttendeeLeaveMeeting = () => {
    if (!recorderSession) {
      logger.warn('No recorder session available.');
      return;
    }
    recorderSession.audioVideo.stopContentShare();
    recorderSession.audioVideo.stop();
    setRecorderSession(null);
  };

  const startContentShare = async () => {
    if (!recorderSession) {
      logger.warn('No recorder session available.');
      return;
    }

    try {
      // Find the annotated content share canvas
      const canvas = document.getElementById('annotated-content-share-preview') as HTMLCanvasElement;
      if (!canvas) {
        logger.error('Could not find annotated content share canvas');
        return;
      }

      // Capture the canvas stream
      let combinedStream;
      try {
        combinedStream = canvas.captureStream(30);
      } catch (error) {
        logger.error(`Failed to capture canvas stream: ${error}`);
        return;
      }

      // Start content share with the combined stream
      await recorderSession.audioVideo.startContentShare(combinedStream);
      setIsRecording(true);

      logger.debug('Annotation recording started');
    } catch (error) {
      // @ts-ignore
      logger.error(`Failed to start content share: ${error?.message || error}`);
      console.error('Content share error:', error);
    }
  };

  // Function to stop the recording process
  const stopRecording = async () => {
    if (recorderSession) {
      try {
        recorderSession.audioVideo.stopContentShare();
        logger.debug('Content share stopped');
      } catch (error) {
        // @ts-ignore
        logger.error(`Failed to stop content share: ${error?.message || error}`);
        console.error('Stop content share error:', error);
      }
    }
    setIsRecording(false);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (recorderSession) {
        try {
          recorderSession.audioVideo.stopContentShare();
          recorderSession.audioVideo.stop();
        } catch (error) {
          // @ts-ignore
          logger.error(`Error cleaning up: ${error?.message || error}`);
        }
      }
    };
  }, [recorderSession, logger]);

  // Create dropdown options for the popover
  const dropdownOptions: ReactNode[] = [
    <PopOverItem key="toggle-annotated-content" onClick={toggleAnnotatedContentShare}>
      <span>{showAnnotatedContentShare ? 'Hide Annotated Content' : 'Show Annotated Content'}</span>
    </PopOverItem>,
    <PopOverItem key="create-attendee" onClick={createAttendeeAndJoinMeeting} disabled={!!recorderSession}>
      <span>Create recorder attendee</span>
    </PopOverItem>,
    <PopOverItem key="remove-attendee" onClick={recorderAttendeeLeaveMeeting} disabled={!recorderSession}>
      <span>Remove recorder attendee</span>
    </PopOverItem>,
    <PopOverItem key="start-content-share" onClick={startContentShare} disabled={!recorderSession || isRecording}>
      <span>Start Content Share</span>
    </PopOverItem>,
  ];

  return (
    <ControlBarButton
      icon={<Camera />}
      onClick={isRecording ? stopRecording : () => {}}
      label={isRecording ? 'Stop Recording' : 'Record Annotations'}
    >
      {!isRecording ? dropdownOptions : null}
    </ControlBarButton>
  );
};

export default AnnotationRecordingControl;
