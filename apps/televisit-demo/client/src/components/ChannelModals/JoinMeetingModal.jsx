// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';

export const JoinMeetingModal = ({
  onClose,
  meetingInfo,
  handleJoinMeeting,
  handleMessageAll,
}) => {
  return (
    <Modal>
      <div>
        <ModalHeader title={`${meetingInfo.channelName}`} />
      </div>
      <div>
        <ModalHeader title={`${meetingInfo.inviter}`} />
      </div>
      <ModalBody>
        <form
          onSubmit={(e) => handleJoinMeeting(e)}
          id="join-meeting-form"
        />
        <form
          onSubmit={(e) => handleMessageAll(e, meetingInfo.channelArn)}
          id="message-all-form"
        />
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Join"
            form="join-meeting-form"
            type="submit"
            variant="primary"
          />,
          <ModalButton label="Decline" closesModal variant="secondary" />,
          <ModalButton
            label="Message all"
            form="message-all-form"
            type="submit"
            variant="primary"
          />
        ]}
      />
    </Modal>
  );
};

export default JoinMeetingModal;
