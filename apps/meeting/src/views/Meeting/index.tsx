// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { UserActivityProvider } from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import DynamicMeetingControls from '../../containers/DynamicMeetingControls';
import { MeetingMode } from '../../types';
import { VideoTileGridProvider } from '../../providers/VideoTileGridProvider';
import { DataMessagesProvider } from '../../providers/DataMessagesProvider';
import CustomVideoTileGrid from '../../components/SL/customVideoTileGrid';

const MeetingView = (props: { mode: MeetingMode }) => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster, showChat } = useNavigation();
  const { mode } = props;

  return (
    <UserActivityProvider>
      <DataMessagesProvider>
        <VideoTileGridProvider>
          <StyledLayout showNav={showNavbar} showRoster={showRoster} showChat={showChat}>
            <StyledContent>
              <CustomVideoTileGrid />
              {mode === MeetingMode.Spectator ? <DynamicMeetingControls /> : <MeetingControls />}
            </StyledContent>
            <NavigationControl />
          </StyledLayout>
        </VideoTileGridProvider>
      </DataMessagesProvider>
    </UserActivityProvider>
  );
};

export default MeetingView;
