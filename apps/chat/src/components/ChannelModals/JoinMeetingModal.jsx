// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';

import './JoinMeetingModal.css';

export const JoinMeetingModal = ({
  onClose,
  meetingInfo,
  handleJoinMeeting,
  handleMessageAll,
}) => {
  return (
    <Modal onClose={onClose} className="join-modal">
      <ModalHeader className="join-header" title={`${meetingInfo.channelName}`} />
      <ModalBody className="join-modal-body">
        <p>{`${meetingInfo.inviter}`}</p>
        <form
          onSubmit={(e) => handleJoinMeeting(e, meetingInfo.meeting, meetingInfo.channelArn)}
          id="join-meeting-form"
        />
        <form
          onSubmit={(e) => handleMessageAll(e, meetingInfo.channelArn)}
          id="message-all-form"
        />
      </ModalBody>
      <div className="response-buttons">
        <ModalButtonGroup 
          primaryButtons={[
            <ModalButton className="join-button"
              label="Join"
              form="join-meeting-form"
              type="submit"
              variant="primary"
            />,
            <ModalButton className="decline-button" label="Decline" closesModal variant="secondary" />
          ]}
        />
      </div>
      <div className="message-buttons">
        <ModalButtonGroup 
          primaryButtons={[
            <ModalButton className="message-all-button"
              label="Message all"
              form="message-all-form"
              type="submit"
              variant="secondary"
              closesModal
            />
          ]}
        />
      </div>
    </Modal>
  );
};

export default JoinMeetingModal;
