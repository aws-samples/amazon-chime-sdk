// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import {
  VideoTileGrid,
  UserActivityProvider,
  useLocalVideo
} from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import DynamicMeetingControls from '../../containers/DynamicMeetingControls';
import { MeetingMode } from '../../types';
import { useAppState } from '../../providers/AppStateProvider';

const MeetingView = (props: { mode: MeetingMode, }) => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster } = useNavigation();
  const { isInMeeting } = useAppState();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();

  useEffect(() => {
    if (isInMeeting && !isVideoEnabled) {
      toggleVideo();
    }
  }, [isInMeeting]);
  
  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster}>
        <StyledContent>
          <VideoTileGrid
            className="videos"
            noRemoteVideoView={<MeetingDetails />}
          />
          {props.mode === MeetingMode.Spectator ?
            <DynamicMeetingControls /> :
            <MeetingControls />
          }
        </StyledContent>
        <NavigationControl />
      </StyledLayout>
    </UserActivityProvider>
  );
};

export default MeetingView;
