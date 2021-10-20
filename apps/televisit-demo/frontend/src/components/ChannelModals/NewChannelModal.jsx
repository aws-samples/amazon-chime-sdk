// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState } from "react";
=======
import React, { useState } from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
  Input,
  Label,
  RadioGroup,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";

import "./NewChannelModal.css";
import { useAuthContext } from "../../providers/AuthProvider";

export const NewChannelModal = ({ onClose, onCreateChannel }) => {
  const [name, setName] = useState("");
  const [privacy, setPrivacy] = useState("PRIVATE");
  const [mode, setMode] = useState("RESTRICTED");
=======
} from 'amazon-chime-sdk-component-library-react';

import './NewChannelModal.css';
import { useAuthContext } from '../../providers/AuthProvider';

export const NewChannelModal = ({ onClose, onCreateChannel }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('PRIVATE');
  const [mode, setMode] = useState('RESTRICTED');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const { member } = useAuthContext();
  const onNameChange = (e) => {
    setName(e.target.value);
  };
  const onPrivacyChange = (e) => {
    setPrivacy(e.target.value);
  };
  const onModeChange = (e) => {
    setMode(e.target.value);
  };
  return (
    <Modal size="lg" onClose={onClose}>
      <ModalHeader title="Add channel" />
      <ModalBody>
        <form
          onSubmit={(e) => onCreateChannel(e, name, mode, privacy)}
          id="new-channel-form"
        >
          <div className="ch-form-field-input">
            <Label className="lbl">Channel name</Label>
            <Input
              className="value"
              showClear={false}
              type="text"
              value={name}
              onChange={(e) => onNameChange(e)}
            />
          </div>
          <div className="ch-form-field-input">
            <Label className="lbl">Moderator</Label>
            <Label className="value">{member.username}</Label>
          </div>
          <div className="ch-form-field-input">
            <Label className="lbl">Type (cannot be changed)</Label>
            <div className="value ch-type-options">
              <RadioGroup
                options={[
<<<<<<< HEAD
                  { value: "PRIVATE", label: "Private" },
                  { value: "PUBLIC", label: "Public" },
=======
                  { value: 'PRIVATE', label: 'Private' },
                  { value: 'PUBLIC', label: 'Public' },
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                ]}
                value={privacy}
                onChange={(e) => onPrivacyChange(e)}
              />
            </div>
          </div>
<<<<<<< HEAD
          {privacy !== "PUBLIC" && (
=======
          {privacy !== 'PUBLIC' && (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
            <div className="ch-form-field-input">
              <Label className="lbl">Mode</Label>
              <div className="value ch-mode-options">
                <RadioGroup
                  options={[
<<<<<<< HEAD
                    { value: "RESTRICTED", label: "Restricted" },
                    { value: "UNRESTRICTED", label: "Unrestricted" },
=======
                    { value: 'RESTRICTED', label: 'Restricted' },
                    { value: 'UNRESTRICTED', label: 'Unrestricted' },
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                  ]}
                  value={mode}
                  onChange={(e) => onModeChange(e)}
                />
              </div>
            </div>
          )}
        </form>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Add"
            type="submit"
            form="new-channel-form"
            variant="primary"
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default NewChannelModal;
