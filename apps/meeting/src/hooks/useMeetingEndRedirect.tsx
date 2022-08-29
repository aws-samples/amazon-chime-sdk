// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
  MeetingStatus,
  useNotificationDispatch,
  Severity,
  ActionType,
  useMeetingStatus,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { useAppState } from '../providers/AppStateProvider';
import { ClearMeetingsFromLocalStorage } from '../utils/helpers';
import { EMPTY_LOCAL_INFO } from '../constants';

const useMeetingEndRedirect = () => {
  const logger = useLogger();
  const history = useHistory();
  const dispatch = useNotificationDispatch();
  const meetingStatus = useMeetingStatus();
  const { joineeType, setLocalInfo, setMeetingJoined } = useAppState();

  useEffect(() => {
    if (meetingStatus === MeetingStatus.Ended) {
      logger.info('[useMeetingEndRedirect] Meeting ended');
      dispatch({
        type: ActionType.ADD,
        payload: {
          severity: Severity.INFO,
          message: `The meeting was ended by the ${joineeType}`,
          autoClose: true,
          replaceAll: true,
        },
      });
      setMeetingJoined(false);
      setLocalInfo(EMPTY_LOCAL_INFO);
      ClearMeetingsFromLocalStorage();
      history.push(`/meeting/`);
    }
  }, [meetingStatus]);
};

export default useMeetingEndRedirect;
