/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
  Input,
  Label, useNotificationDispatch,
} from 'amazon-chime-sdk-component-library-react';

import { MAX_PRESENCE_STATUS_LENGTH } from "../../utilities/presence";

import './SetCustomStatusModal.css';

export const SetCustomStatusModal = ({ onClose, setCustomStatus }) => {
  const [status, setStatus] = useState('');
  const dispatch = useNotificationDispatch();

  const onStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const onSubmit = async (e) => {
    if (!status) {
      dispatch({
        type: 0,
        payload: {
          message: 'Error, custom status cannot be blank.',
          severity: 'error',
        },
      });
    } else if (status.length > MAX_PRESENCE_STATUS_LENGTH) {
      dispatch({
        type: 0,
        payload: {
          message: `Error, custom status length cannot exceed ${MAX_PRESENCE_STATUS_LENGTH} characters.`,
          severity: 'error',
        },
      });
    }
    try {
      await setCustomStatus(e, status);
    } catch {
      dispatch({
        type: 0,
        payload: {
          message: 'Unable to set custom status.',
          severity: 'error',
        },
      });
    } finally {
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Custom status" />
      <ModalBody>
      <Label className="lbl">Type in a custom status message about your availability.</Label>
        <form id="custom-status-form" onSubmit={(e) => onSubmit(e)}>
          <div className="custom-status-form-field-input">
            <Label className="lbl">Status</Label>
            <div className="custom-status-form-field-input-div">
              <Input
                className="value"
                type="text"
                value={status}
                onChange={(e) => onStatusChange(e)}
                placeholder={"Type status"}
              />
              <Label className="max-length-lbl">{MAX_PRESENCE_STATUS_LENGTH} characters maximum</Label>
            </div>
          </div>
        </form>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Save"
            type="submit"
            form="custom-status-form"
            variant="primary"
          />,
          <ModalButton label="Cancel" variant="secondary" closesModal/>,
        ]}
      />
    </Modal>
  );
};

export default SetCustomStatusModal;
