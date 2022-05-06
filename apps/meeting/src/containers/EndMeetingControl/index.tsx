// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  ControlBarButton,
  Phone,
  useMeetingManager
} from 'amazon-chime-sdk-component-library-react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../../constants/routes';


const EndMeetingControl: React.FC = () => {
  const history = useHistory();
  const meetingManager = useMeetingManager();
  const leaveMeeting = async (): Promise<void> => {
    await meetingManager.leave();
    history.push(routes.HOME);
  };

  return <ControlBarButton icon={<Phone />} onClick={leaveMeeting} label="Leave" />;

};

export default EndMeetingControl;
