import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { SetToLocalStorage } from "../../../utils/helpers/localStorageHelper";
import { LOCAL_STORAGE_ITEM_KEYS } from "../../../utils/enums";
import { useHistory } from "react-router-dom";
import { usePluginState } from "../../../providers/PluginProvider";
import { SLPlugin, SLPlugins } from "../../../plugins/IframePlugin/pluginManager";
import {DeferredCall} from '../../../utils/helpers'

const DUMMY_TEACHER_ID = "123";

const TeacherLobby: React.FC = () => {
  const { meetingId, localUserName, joineeType, setMeetingJoined } = useAppState();
  const { errorMessage, updateErrorMessage } = useContext(getErrorContext());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const { roster } = useRosterState();
  const history = useHistory();
  const { sendCustomEvent } = usePluginState();

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
      
      // Sending meeting started event
      const eventParams = {
        message: SLPlugin.Lobby,
        payload: {
          action: SLPlugins.lobby.teacherStartedMeeting,
          startedBy: localUserName,
          userType: joineeType,
        }
      }
      sendCustomEvent(eventParams);

      history.push(`/meeting/${meetingId}`);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  const studentsCount = useMemo(() => {
    // The getAttendee callback takes around 1-2 seconds, till then -1 is shown, to get around that,
    // we show 0 till api call is finished and number is updated correctly.
    return Object.keys(roster).length - 1 < 0
      ? 0
      : Object.keys(roster).length - 1;
  }, [roster, DUMMY_TEACHER_ID]);

  const init = (): void => {
    // Sending teacher lobby joined event
    DeferredCall(() => {
      const eventParams = {
        message: SLPlugin.Lobby,
        payload: {
          action: SLPlugins.lobby.teacherJoinedLobby,
          startedBy: localUserName,
          userType: joineeType,
        }
      };
      sendCustomEvent(eventParams)
    });
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
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
          {`Waiting students count: ${studentsCount}`}
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
              label="Start meeting"
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

export default TeacherLobby;
