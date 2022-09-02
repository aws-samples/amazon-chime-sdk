import React, { useContext } from 'react';
import {
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
  RosterType,
} from 'amazon-chime-sdk-component-library-react';
import Spinner from '../../../components/icons/Spinner';
import { useAppState } from '../../../providers/AppStateProvider';
import { getErrorContext } from '../../../providers/ErrorProvider';
import Card from '../../Card';
import { BigButtonStyles } from '../../../styles/customStyles';

const DUMMY_WAITING_STUDENTS_COUNT = 5;

interface ITeacherLobbyProps {
  handleStartMeeting: (e: any) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  roster: RosterType
}

const TeacherLobby: React.FC<ITeacherLobbyProps> = ({handleStartMeeting, isLoading, setIsLoading, roster}) => {

  const {
    meetingId
  } = useAppState();
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());

  const closeError = (): void => {
    updateErrorMessage('');
    setIsLoading(false);
  };

  return (
    <form>
      <Heading
        tag="h1"
        level={4}
        css="text-align: center;  margin-bottom: 3rem;"
      >
        Teacher Lobby
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 1rem;">
        {`Meeting Id: ${meetingId}`}
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 5rem;">
        {`Waiting students count: ${DUMMY_WAITING_STUDENTS_COUNT}`}
      </Heading>
      <Flex
        container
        layout="fill-space-centered"
        style={{ marginTop: "2.5rem" }}
      >
        {isLoading ? <Spinner /> : <PrimaryButton
          label="Start meeting"
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

export default TeacherLobby;
