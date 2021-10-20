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

import ContactPicker from "../ContactPicker";
=======
} from 'amazon-chime-sdk-component-library-react';

import ContactPicker from '../ContactPicker';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

export const ManageMembersModal = ({
  onClose,
  channel,
  members,
  handlePickerChange,
  handleDeleteMemberships,
}) => {
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Manage members in ${channel.Name}`} />
      <ModalBody className="modal-body">
        <ContactPicker onChange={handlePickerChange} options={members} />
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Remove"
            onClick={handleDeleteMemberships}
            variant="primary"
            closesModal
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default ManageMembersModal;
