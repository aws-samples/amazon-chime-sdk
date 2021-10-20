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
=======
} from 'amazon-chime-sdk-component-library-react';

import './NewChannelModal.css';
import { useAuthContext } from '../../providers/AuthProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const StartRecordMeetingModal = ({ isStartOpen, onClose, startRecording }) => {
  const [mode, setMode] = useState(1);
  const onModeChange = (e) => {
    setMode(e.target.value);
  };
  const { member } = useAuthContext();

  return (
<<<<<<< HEAD
    isStartOpen && (
      <Modal size="lg" onClose={onClose}>
        <ModalHeader title="Start Meeting Recording" />
        <ModalBody>
          <form onSubmit={(e) => startRecording(e)} id="record-meeting-form">
            <div className="ch-form-field-input">
              <Label className="lbl">Moderator</Label>
              <Label className="value">{member.username}</Label>
            </div>
            <div className="ch-form-field-input">
              <Label className="lbl">Recording Options</Label>
              <div className="value">
                <RadioGroup
                  options={[
                    { value: "1", label: "Just Recording" },
                    { value: "2", label: "Recording and Transcription" },
                    {
                      value: "3",
                      label: "Recording, Transcription, and Comprehension",
                    },
                  ]}
                  value={1}
                  onChange={(e) => onModeChange(e)}
                />
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              label="Start"
              type="submit"
              form="record-meeting-form"
              variant="primary"
            />,
            <ModalButton label="Cancel" closesModal variant="secondary" />,
          ]}
        />
      </Modal>
    )
=======
    isStartOpen && <Modal size="lg" onClose={onClose}>
      <ModalHeader title="Start Meeting Recording" />
      <ModalBody>
        <form
          onSubmit={(e) => startRecording(e)}
          id="record-meeting-form"
        >
          <div className="ch-form-field-input">
            <Label className="lbl">Moderator</Label>
            <Label className="value">{member.username}</Label>
          </div>
          <div className="ch-form-field-input">
            <Label className="lbl">Recording Options</Label>
            <div className="value">
              <RadioGroup
                options={[
                  { value: '1', label: 'Just Recording' },
                  { value: '2', label: 'Recording and Transcription' },
                  { value: '3', label: 'Recording, Transcription, and Comprehension' },
                ]}
                value={1}
                onChange={(e) => onModeChange(e)}
              />
            </div>
          </div>
        </form>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Start"
            type="submit"
            form="record-meeting-form"
            variant="primary"
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  );
};

const StopRecordMeetingModal = ({ isStopOpen, onClose, stopRecording }) => {
<<<<<<< HEAD
  const [privacy, setPrivacy] = useState("PRIVATE");
  const [mode, setMode] = useState("RESTRICTED");
=======
  const [privacy, setPrivacy] = useState('PRIVATE');
  const [mode, setMode] = useState('RESTRICTED');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const { member } = useAuthContext();

  return (
<<<<<<< HEAD
    isStopOpen && (
      <Modal size="lg" onClose={onClose}>
        <ModalHeader title="Stop Meeting Recording" />
        <ModalBody>
          <form onSubmit={(e) => stopRecording(e)} id="record-meeting-form">
            <div className="ch-form-field-input">
              <Label className="lbl">Moderator</Label>
              <Label className="value">{member.username}</Label>
            </div>
          </form>
        </ModalBody>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              label="Stop"
              type="submit"
              form="record-meeting-form"
              variant="primary"
            />,
            <ModalButton label="Cancel" closesModal variant="secondary" />,
          ]}
        />
      </Modal>
    )
  );
};

export { StartRecordMeetingModal, StopRecordMeetingModal };
=======
    isStopOpen && <Modal size="lg" onClose={onClose}>
      <ModalHeader title="Stop Meeting Recording" />
      <ModalBody>
        <form
          onSubmit={(e) => stopRecording(e)}
          id="record-meeting-form"
        >
          <div className="ch-form-field-input">
            <Label className="lbl">Moderator</Label>
            <Label className="value">{member.username}</Label>
          </div>
        </form>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Stop"
            type="submit"
            form="record-meeting-form"
            variant="primary"
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export {
  StartRecordMeetingModal,
  StopRecordMeetingModal
};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
