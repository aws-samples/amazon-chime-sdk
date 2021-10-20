// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import {
  VideoTileGrid,
  UserActivityProvider,
} from "amazon-chime-sdk-component-library-react";

import { StyledLayout, StyledContent } from "./Styled";
import NavigationControl from "../../containers/Navigation/NavigationControl";
import { useNavigation } from "../../providers/NavigationProvider";
import MeetingDetails from "../../containers/MeetingDetails";
import MeetingControls from "../../containers/MeetingControls";
import useMeetingEndRedirect from "../../hooks/useMeetingEndRedirect";
import MeetingMetrics from "../../containers/MeetingMetrics";
=======
import React from 'react';
import {
  VideoTileGrid,
  UserActivityProvider
} from 'amazon-chime-sdk-component-library-react';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import MeetingMetrics from '../../containers/MeetingMetrics';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MeetingView = () => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster, showChat, showTranscript } = useNavigation();

  return (
    <UserActivityProvider>
<<<<<<< HEAD
      <StyledLayout
        showNav={showNavbar}
        showRoster={showRoster}
        showChat={showChat}
        showTranscript={showTranscript}
      >
=======
      <StyledLayout showNav={showNavbar} showRoster={showRoster} showChat={showChat} showTranscript={showTranscript}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        <StyledContent>
          <MeetingMetrics />
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
