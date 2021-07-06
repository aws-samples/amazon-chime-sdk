// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC } from 'react';

import {
  AudioInputControl,
  AudioOutputControl,
  ControlBar,
  ControlBarButton,
  Phone,
  useMeetingManager,
  VideoInputControl,
  VideoTileGrid
} from 'amazon-chime-sdk-component-library-react';
import { endMeeting } from '../utils/api';

const Meeting: FC = () => {
  const meetingManager = useMeetingManager();

  const clickedEndMeeting = async () => {
    const meetingId = meetingManager.meetingId;
    if (meetingId) {
      await endMeeting(meetingId);
      await meetingManager.leave();
    }
  }
  
  return (
      <div style={{marginTop: '2rem', height: '40rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <VideoTileGrid/>
        <ControlBar
          layout="undocked-horizontal"
          showLabels
        >
          <AudioInputControl />
          <VideoInputControl />
          <AudioOutputControl />
          <ControlBarButton icon={<Phone />} onClick={clickedEndMeeting} label="End" />
        </ControlBar>
      </div>
  );
};

export default Meeting;
