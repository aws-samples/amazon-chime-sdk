import { Modal, ModalBody, ModalHeader, useMeetingManager } from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  StyledDiv,
  StyledWrapper,
} from "../../containers/MeetingFormSelector/Styled";
import { useAppState } from "../../providers/AppStateProvider";
import { LOCAL_STORAGE_ITEM_KEYS, USER_TYPES } from "../../utils/enums";
import { SetToLocalStorage } from "../../utils/helpers/localStorageHelper";
import { StyledLayout } from "../../views/DeviceSetup/Styled";
import Card from "../Card";
import StudentLobby from "./StudentLobby";
import TeacherLobby from "./TeacherLobby";

const Lobby = () => {
  const { meetingId, joineeType, setMeetingJoined } = useAppState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const history = useHistory();
  const meetingManager = useMeetingManager();


  const handleStartMeeting = async (e: any): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await meetingManager.start();
      setMeetingJoined(true);
      SetToLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_JOINED, true);
      setIsLoading(false);
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
      />
    ) : (
      <TeacherLobby
        handleStartMeeting={handleStartMeeting}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
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
