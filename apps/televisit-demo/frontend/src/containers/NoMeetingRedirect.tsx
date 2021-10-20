// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
=======
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  useMeetingManager,
  useNotificationDispatch,
  Severity,
<<<<<<< HEAD
  ActionType,
} from "amazon-chime-sdk-component-library-react";

import routes from "../constants/routes";
=======
  ActionType
} from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const NoMeetingRedirect: React.FC = ({ children }) => {
  const history = useHistory();
  const dispatch = useNotificationDispatch();
  const meetingManager = useMeetingManager();

  const payload: any = {
    severity: Severity.INFO,
<<<<<<< HEAD
    message: "No meeting found, please enter a valid meeting Id",
    autoClose: true,
=======
    message: 'No meeting found, please enter a valid meeting Id',
    autoClose: true
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  };

  useEffect(() => {
    if (!meetingManager.meetingSession) {
      dispatch({
        type: ActionType.ADD,
<<<<<<< HEAD
        payload: payload,
=======
        payload: payload
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      });
      history.push(routes.CHAT);
    }
  }, []);

  return <>{children}</>;
};

export default NoMeetingRedirect;
