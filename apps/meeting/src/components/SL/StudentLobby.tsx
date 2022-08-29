import React, { useContext, useEffect, useState } from 'react';
import {
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
} from 'amazon-chime-sdk-component-library-react';

import Spinner from '../../components/icons/Spinner';
import { useAppState } from '../../providers/AppStateProvider';
import { getErrorContext } from '../../providers/ErrorProvider';
import Card from '../Card';
import { BigButtonStyles } from '../../styles/customStyles';

const DUMMY_OTHER_STUDENTS_COUNT = 5;

interface IStudentLobbyProps {
  handleStartMeeting: (e: any) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const StudentLobby : React.FC<IStudentLobbyProps> = ({handleStartMeeting, isLoading, setIsLoading}) => {
  const [hasTeacherStartedMeeting, setHasTeacherStartedMeeting] = useState<
    boolean
  >(false);
  const [hasTeacherJoined, setHasTeacherJoined] = useState<boolean>(false);

  const {
    meetingId
  } = useAppState();
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());

  const closeError = (): void => {
    updateErrorMessage('');
    setIsLoading(false);
  };

  // Just to avoid webpack warnings
  useEffect(() => {
    setHasTeacherStartedMeeting(false);
    setHasTeacherJoined(false);
    // Will be updated later when logic is known
    (() => setTimeout(() => setHasTeacherStartedMeeting(true), 2000))();
  }, []);

  return (
    <form>
      <Heading
        tag="h1"
        level={4}
        css="text-align: center; margin-bottom: 3rem;"
      >
        Student Lobby
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 1rem;">
        {`Meeting Id: ${meetingId}`}
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 1rem;">
        {`Other students count: ${DUMMY_OTHER_STUDENTS_COUNT}`}
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 5rem;">
        {hasTeacherJoined
          ? "Teacher has joined the meet"
          : "Waiting for teacher to join the meet"}
      </Heading>
      <Flex
        container
        layout="fill-space-centered"
        style={{ marginTop: "2.5rem" }}
      >
        {isLoading ? <Spinner /> : <PrimaryButton
          disabled={!hasTeacherStartedMeeting}
          label={hasTeacherStartedMeeting ? "Join meet" : "Waiting for teacher"}
          onClick={handleStartMeeting}
          style={BigButtonStyles}
        />}
      </Flex>
      {errorMessage && (
        <Modal size="md" onClose={closeError}>
          <ModalHeader title={`Meeting ID: ${meetingId}`} />
          <ModalBody>
            <Card
              title="Unable to join meeting"
              description="There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired."
              smallText={errorMessage}
            />
          </ModalBody>
        </Modal>
      )}
    </form>
  );
};

export default StudentLobby;
