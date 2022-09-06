import React, { useContext, useEffect, useState } from "react";
import {
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalHeader,
  PrimaryButton,
  useRosterState,
} from "amazon-chime-sdk-component-library-react";

import Spinner from "../../../components/icons/Spinner";
import { useAppState } from "../../../providers/AppStateProvider";
import { getErrorContext } from "../../../providers/ErrorProvider";
import Card from "../../Card";
import { BigButtonStyles } from "../../../styles/customStyles";
import { SLPlugins } from "../../../plugins/IframePlugin/pluginManager";
import { usePluginState } from "../../../providers/PluginProvider";
import { useHistory } from "react-router-dom";
import { GetFromLocalStorage, SetToLocalStorage } from "../../../utils/helpers/localStorageHelper";
import { listParticipants } from "../../../utils/api";
import { LOCAL_STORAGE_ITEM_KEYS, USER_TYPES } from "../../../utils/enums";

const StudentLobby: React.FC = () => {
  const { meetingId, setMeetingJoined } = useAppState();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { roster } = useRosterState();
  const history = useHistory();
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const { recievedLobbyPluginData } = usePluginState();
  const [otherStudentsCount, setOtherStudentsCount] = useState<number | null>(null);

  const meetingStartedForAll = GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_STARTED_FOR_ALL) || null; 
  const [hasTeacherStartedMeeting, setHasTeacherStartedMeeting] = useState<boolean>(meetingStartedForAll ? true : false);
  const [hasTeacherJoined, setHasTeacherJoined] = useState<boolean>(meetingStartedForAll ? true : false);

  const closeError = (): void => {
    updateErrorMessage("");
    setIsLoading(false);
  };

  const handleStartMeeting = async (e: any): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setMeetingJoined(true);
      SetToLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_JOINED, true);
      history.push(`/meeting/${meetingId}`);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  const handleLobbyPluginEvent = (recievedLobbyPluginData: any): void => {
    switch (recievedLobbyPluginData?.payload?.action) {
      case SLPlugins.lobby.teacherJoinedLobby:
        {
          setHasTeacherJoined(true);
        }
        break;
      case SLPlugins.lobby.teacherStartedMeeting:
        {
          setHasTeacherStartedMeeting(true);
        }
        break;
    }
  };

  const updateLobbyStatus = async () => {
    let teacherFound = false;
    const participants = await listParticipants(meetingId, GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.PARTICIPANT_TOKEN));
    participants.map((currentParticipant: any) => {
      if(currentParticipant.userType === USER_TYPES.TEACHER){
        teacherFound = true;

        // This will come in handly when a students joins the lobby late (after teacher
        // has already joined and `SLPlugins.lobby.teacherJoinedLobby` is dispatched).
        // During roster update we will check if teacher is there and update here.
        setHasTeacherJoined(true);
      }
    })

    // Since we have to show count of other students, then
    // 1. If teacher is not present, other students count will be currentAttendeesCount (including current user) - 1 (current user)
    // 2. If teacher is present, currentAttendeesCount (including current user) - 2 (current user + teacher)
    let res;
    if (teacherFound) {
      res = Object.keys(roster || {}).length - 2;
    } else {
      res = Object.keys(roster || {}).length - 1;
    }
    res < 0 ? setOtherStudentsCount(0) : setOtherStudentsCount(res);
  }

  useEffect(() => {
    // update lobby status whenever there's a change in roster state.
    updateLobbyStatus();
  }, [roster]);

  useEffect(() => {
    handleLobbyPluginEvent(recievedLobbyPluginData);
  }, [recievedLobbyPluginData]);

  return (
    <>
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
          {`Other students count: ${otherStudentsCount}`}
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
          {isLoading ? (
            <Spinner />
          ) : (
            <PrimaryButton
              disabled={!hasTeacherStartedMeeting}
              label={
                hasTeacherStartedMeeting ? "Join meet" : "Waiting for teacher"
              }
              onClick={handleStartMeeting}
              style={BigButtonStyles}
            />
          )}
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
      {error && (
        <Modal size="md" onClose={(): void => setError("")}>
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

export default StudentLobby;
