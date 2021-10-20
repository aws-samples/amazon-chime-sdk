// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import {
  useNotificationState,
  NotificationGroup,
} from "amazon-chime-sdk-component-library-react";
=======
import React from 'react';
import {
  useNotificationState,
  NotificationGroup,
} from 'amazon-chime-sdk-component-library-react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const Notifications = () => {
  const { notifications } = useNotificationState();

  return notifications.length ? <NotificationGroup /> : null;
};

export default Notifications;
