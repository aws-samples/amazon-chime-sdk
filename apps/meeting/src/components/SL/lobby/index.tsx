import { Modal, ModalBody, ModalHeader, useRosterState } from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  StyledDiv,
  StyledWrapper,
} from "../../../containers/MeetingFormSelector/Styled";
import { useAppState } from "../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../utils/enums";
import { StyledLayout } from "../../../views/DeviceSetup/Styled";
import Card from "../../Card";
import StudentLobby from "./StudentLobby";
import TeacherLobby from "./TeacherLobby";

const Lobby = () => {
  const { meetingId, joineeType } = useAppState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const history = useHistory();
  const { roster } = useRosterState();


  const handleStartMeeting = async (e: any): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      history.push(`/meeting/${meetingId}`);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  const screenToRender =
    joineeType === USER_TYPES.STUDENT ? (
      <StudentLobby
        handleStartMeeting={handleStartMeeting}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        roster={roster}
      />
    ) : (
      <TeacherLobby
        handleStartMeeting={handleStartMeeting}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        roster={roster}
      />
    );

  return (<>
    <StyledLayout>
      <StyledWrapper>
        <StyledDiv>{screenToRender}</StyledDiv>
      </StyledWrapper>
    </StyledLayout>
    {error && (
        <Modal size="md" onClose={(): void => setError('')}>
          <ModalHeader title={`Meeting ID: ${meetingId}`} />
          <ModalBody>
            <Card
              title="Unable to join meeting"
              description="There was an issue in joining this meeting. Check your connectivity and try again."
              smallText={error}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default Lobby;
