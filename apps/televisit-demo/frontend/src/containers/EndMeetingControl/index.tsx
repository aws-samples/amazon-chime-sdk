// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
=======
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
<<<<<<< HEAD
  ModalButtonGroup,
} from "amazon-chime-sdk-component-library-react";

import { endMeeting } from "../../api/ChimeAPI";
import { StyledP } from "./Styled";
import { useAppState } from "../../providers/AppStateProvider";
import routes from "../../constants/routes";
=======
  ModalButtonGroup
} from 'amazon-chime-sdk-component-library-react';

import { endMeeting } from '../../api/ChimeAPI';
import { StyledP } from './Styled';
import { useAppState } from '../../providers/AppStateProvider';
import routes from '../../constants/routes';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const EndMeetingControl: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);
  const { meetingId } = useAppState();
  const history = useHistory();

  const leaveMeeting = async (): Promise<void> => {
    history.push(routes.CHAT);
  };

  const endMeetingForAll = async (): Promise<void> => {
    try {
      if (meetingId) {
        await endMeeting(meetingId);
        history.push(routes.CHAT);
      }
    } catch (e) {
<<<<<<< HEAD
      console.log("Could not end meeting", e);
=======
      console.log('Could not end meeting', e);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    }
  };

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="Leave" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="End Meeting" />
          <ModalBody>
            <StyledP>
              Leave meeting or you can end the meeting for all. The meeting
              cannot be used once it ends.
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                onClick={endMeetingForAll}
                variant="primary"
                label="End meeting for all"
                closesModal
              />,
              <ModalButton
                onClick={leaveMeeting}
                variant="primary"
                label="Leave Meeting"
                closesModal
              />,
<<<<<<< HEAD
              <ModalButton variant="secondary" label="Cancel" closesModal />,
=======
              <ModalButton variant="secondary" label="Cancel" closesModal />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
