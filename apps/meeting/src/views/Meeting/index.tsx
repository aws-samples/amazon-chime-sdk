// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { VideoTileGrid, UserActivityProvider } from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import DynamicMeetingControls from '../../containers/DynamicMeetingControls';
import { MeetingMode, Layout } from '../../types';
import { VideoTileGridProvider } from '../../providers/VideoTileGridProvider';
import { useAppState } from '../../providers/AppStateProvider';
import { DataMessagesProvider } from '../../providers/DataMessagesProvider';
import MeetingStatusNotifier from '../../containers/MeetingStatusNotifier';

const MeetingView = (props: { mode: MeetingMode }) => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster, showChat } = useNavigation();
  const { mode } = props;
  const { layout } = useAppState();

  return (
    <UserActivityProvider>
      <DataMessagesProvider>
        <VideoTileGridProvider>
          <StyledLayout $showNav={showNavbar} $showRoster={showRoster} $showChat={showChat}>
            <StyledContent>
              <VideoTileGrid
                layout={layout === Layout.Gallery ? 'standard' : 'featured'}
                className="videos"
                noRemoteVideoView={<MeetingDetails />}
              />
              {mode === MeetingMode.Spectator ? <DynamicMeetingControls /> : <MeetingControls />}
            </StyledContent>
            <MeetingStatusNotifier />
            <NavigationControl />
          </StyledLayout>
        </VideoTileGridProvider>
      </DataMessagesProvider>
    </UserActivityProvider>
  );
};

export default MeetingView;
