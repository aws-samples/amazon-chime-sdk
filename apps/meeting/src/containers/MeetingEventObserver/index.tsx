// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useLogger, useMeetingEvent } from 'amazon-chime-sdk-component-library-react';

const MeetingEventObserver = () => {
  const logger = useLogger();
  const meetingEvent = useMeetingEvent();
  if (meetingEvent) {
    logger.info(`Received meeting event in MeetingEventObserver: ${JSON.stringify(meetingEvent)}`);
  }
  return null;
};

export default MeetingEventObserver;
