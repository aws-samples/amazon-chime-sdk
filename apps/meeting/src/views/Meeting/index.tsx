// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  UserActivityProvider
} from 'amazon-chime-sdk-component-library-react';
import React from 'react';
import DynamicMeetingControls from '../../containers/DynamicMeetingControls';
import MeetingControls from '../../containers/MeetingControls';
import { CustomizedVideoTileGrid } from '../../containers/CustomizedVideoTileGrid';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import { useGridState } from '../../providers/GridStateProvider';
import { useNavigation } from '../../providers/NavigationProvider';
import { MeetingMode } from '../../types';
import { StyledContent, StyledLayout } from './Styled';


const MeetingView = (props: { mode: MeetingMode, }) => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster } = useNavigation();
  const { layout } = useGridState();

  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster}>
        <StyledContent>
          <CustomizedVideoTileGrid layout={layout} />
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
