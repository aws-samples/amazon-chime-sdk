// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";
=======
} from 'amazon-chime-sdk-component-library-react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

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
<<<<<<< HEAD
        <form onSubmit={(e) => handleJoinMeeting(e)} id="join-meeting-form" />
=======
        <form
          onSubmit={(e) => handleJoinMeeting(e)}
          id="join-meeting-form"
        />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
          />,
=======
          />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        ]}
      />
    </Modal>
  );
};

export default JoinMeetingModal;
