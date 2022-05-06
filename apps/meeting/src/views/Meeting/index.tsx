// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react';
import {
  VideoTileGrid,
  UserActivityProvider,
  MeetingStatus,
  useLocalVideo,
  useMeetingStatus,
  useToggleLocalMute
} from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';

const MeetingView = () => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster } = useNavigation();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const { muted, toggleMute } = useToggleLocalMute();
  const meetingStatus = useMeetingStatus();

  useEffect(() => {
    const toggle = async () => {
      if (meetingStatus === MeetingStatus.Succeeded) {
        if (!isVideoEnabled) {
          await toggleVideo();
        }
        if (!muted) {
          toggleMute();
        }
      }
    };

    toggle();
  }, [meetingStatus]);

  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster}>
        <StyledContent>
          <VideoTileGrid
            className="videos"
            noRemoteVideoView={<MeetingDetails />}
          />
          <MeetingControls />
        </StyledContent>
        <NavigationControl />
      </StyledLayout>
    </UserActivityProvider>
  );
};

export default MeetingView;
