// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';
import { useUserPermission } from '../../providers/UserPermissionProvider';

export const LeaveChannelModal = ({ onClose, channel, handleLeaveChannel, leaveSubChannel }) => {
  const userPermission = useUserPermission();
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Leave ${channel.Name}?`} />
      <ModalBody>
        <p>You cannot undo this action.</p>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Leave"
            onClick={(userPermission.role === 'moderator' && channel.SubChannelId) ? leaveSubChannel : handleLeaveChannel}
            variant="primary"
            closesModal
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default LeaveChannelModal;
