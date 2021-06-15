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

export const DeleteChannelModal = ({
  onClose,
  channel,
  handleChannelDeletion,
}) => {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Delete channel ${channel.Name}`} />
      <ModalBody>
        <form
          onSubmit={(e) => handleChannelDeletion(e, channel.ChannelArn, channel.Metadata)}
          id="deletion-form"
        />
        <p>You cannot undo this action.</p>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Delete"
            form="deletion-form"
            type="submit"
            variant="primary"
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default DeleteChannelModal;
