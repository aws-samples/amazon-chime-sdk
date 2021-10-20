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
          onSubmit={(e) => handleChannelDeletion(e, channel.ChannelArn)}
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
