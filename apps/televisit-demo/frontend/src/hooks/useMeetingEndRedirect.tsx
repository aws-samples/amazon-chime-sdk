// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
=======
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  MeetingStatus,
  useNotificationDispatch,
  Severity,
  ActionType,
<<<<<<< HEAD
  useMeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import routes from "../constants/routes";
=======
  useMeetingStatus
} from 'amazon-chime-sdk-component-library-react';
import routes from '../constants/routes';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const useMeetingEndRedirect = () => {
  const history = useHistory();
  const dispatch = useNotificationDispatch();
  const meetingStatus = useMeetingStatus();

  useEffect(() => {
    if (meetingStatus === MeetingStatus.Ended) {
<<<<<<< HEAD
      console.log("[useMeetingEndRedirect] Meeting ended");
=======
      console.log('[useMeetingEndRedirect] Meeting ended');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      dispatch({
        type: ActionType.ADD,
        payload: {
          severity: Severity.INFO,
<<<<<<< HEAD
          message: "The meeting was ended by another attendee",
          autoClose: true,
          replaceAll: true,
        },
=======
          message: 'The meeting was ended by another attendee',
          autoClose: true,
          replaceAll: true
        }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      });
      history.push(routes.CHAT);
    }
  }, [meetingStatus]);
};

export default useMeetingEndRedirect;
