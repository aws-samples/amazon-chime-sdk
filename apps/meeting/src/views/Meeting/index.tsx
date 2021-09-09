// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect} from 'react';
import {
  VideoTileGrid,
  useAudioVideo,
  UserActivityProvider
} from 'amazon-chime-sdk-component-library-react';
import { AudioVideoObserver, VideoTileState } from 'amazon-chime-sdk-js';

import { StyledLayout, StyledContent } from './Styled';
import NavigationControl from '../../containers/Navigation/NavigationControl';
import { useNavigation } from '../../providers/NavigationProvider';
import MeetingDetails from '../../containers/MeetingDetails';
import MeetingControls from '../../containers/MeetingControls';
import useMeetingEndRedirect from '../../hooks/useMeetingEndRedirect';
import DynamicMeetingControls from '../../containers/DynamicMeetingControls';
import { MeetingMode } from '../../types';

const MeetingView = (props: { mode: MeetingMode, }) => {
  useMeetingEndRedirect();
  const { showNavbar, showRoster } = useNavigation();
  const audioVideo = useAudioVideo();

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const observer: AudioVideoObserver = {
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          tileState?.boundAttendeeId &&
          tileState?.tileId &&
          !tileState.isContent &&
          !tileState.localTile
        ) {
          // audioVideo.pauseVideoTile(tileState?.tileId);
        }
      },
    };

    audioVideo.addObserver(observer);
    return () => audioVideo.removeObserver(observer);
  }, [audioVideo]);

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
