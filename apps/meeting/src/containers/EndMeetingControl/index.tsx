// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { endMeeting } from '../../utils/api';
import { StyledP } from './Styled';
import { useAppState } from '../../providers/AppStateProvider';
import { USER_TYPES } from '../../utils/enums';
import routes from '../../constants/routes';
import { ClearMeetingsFromLocalStorage } from '../../utils/helpers';
import { EMPTY_LOCAL_INFO } from '../../constants';

const EndMeetingControl: React.FC = () => {
  const logger = useLogger();
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);
  const { meetingId, setMeetingJoined, joineeType, setLocalInfo } = useAppState();
  const history = useHistory();

  const leaveMeeting = async (): Promise<void> => {
    setMeetingJoined(false);
    setLocalInfo(EMPTY_LOCAL_INFO);
    ClearMeetingsFromLocalStorage();
    history.push(routes.HOME);
  };

  const endMeetingForAll = async (): Promise<void> => {
    try {
      if (meetingId) {
        await endMeeting(meetingId);
        setMeetingJoined(false);
        setLocalInfo(EMPTY_LOCAL_INFO);
        ClearMeetingsFromLocalStorage();
        history.push(`${routes.BASE_URL}`);
      }
    } catch (e) {
      logger.error(`Could not end meeting: ${e}`);
    }
  };

  // Only teacher or ADMIN can end meeting for all
  const buttonGroup = joineeType !== USER_TYPES.STUDENT ? [
    <ModalButton
      key="end-meeting-for-all"
      onClick={endMeetingForAll}
      variant="primary"
      label="End meeting for all"
      closesModal
    />,
    <ModalButton
      key="leave-meeting"
      onClick={leaveMeeting}
      variant="primary"
      label="Leave Meeting"
      closesModal
    />,
    <ModalButton key="cancel-meeting-ending" variant="secondary" label="Cancel" closesModal />,
  ] : [<ModalButton
        key="leave-meeting"
        onClick={leaveMeeting}
        variant="primary"
        label="Leave Meeting"
        closesModal
      />,
      <ModalButton key="cancel-meeting-ending" variant="secondary" label="Cancel" closesModal />
    ];

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
            primaryButtons={buttonGroup}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
