// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DeviceLabels, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes';
import DevicePermissionPrompt from '../../containers/DevicePermissionPrompt';
import { useAppState } from '../../providers/AppStateProvider';
import { createGetAttendeeCallback, fetchMeeting } from '../../utils/api';


const Home = () => {
  const history = useHistory();
  const meetingManager = useMeetingManager();
  const { setAppMeetingInfo } = useAppState();

  useEffect(() => {
    const getMeetingId = (): string => {
      const query = new URLSearchParams(location.search);
      let meetingId = 'default';
      const meetingIdFromURL = query.get('meetingId');
      const meetingIdFromLocalStorage = window.localStorage.getItem('meetingId');

      if (meetingIdFromURL) {
        window.localStorage.setItem('meetingId', meetingIdFromURL)
        meetingId = meetingIdFromURL;
      }
      else if (meetingIdFromLocalStorage) {
        meetingId = meetingIdFromLocalStorage;
      }
      return meetingId;
    };

    const joinMeeting = async () => {
      const meetingId = getMeetingId();
      const attendeeName = 'attendee' + Math.floor(Math.random() * 10);
      const region = 'us-east-1';
      setAppMeetingInfo(meetingId, attendeeName, region);

      meetingManager.getAttendee = createGetAttendeeCallback(meetingId);

      const { JoinInfo } = await fetchMeeting(meetingId, attendeeName, region);
      await meetingManager.join({
        meetingInfo: JoinInfo?.Meeting,
        attendeeInfo: JoinInfo?.Attendee,
        deviceLabels: DeviceLabels.AudioAndVideo,

      });
      await meetingManager.start();
      history.push(`${routes.MEETING}/${meetingId}`);
    }

    joinMeeting();
  }, [])

  return < DevicePermissionPrompt />;
};

export default Home;
