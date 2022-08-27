import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { BigButtonStyles } from "../../styles/customStyles";

const DUMMY_OTHER_STUDENTS_COUNT = 5;

const StudentLobby = () => {
  const { meetingId } = useAppState();
  const [hasTeacherStartedMeeting, setHasTeacherStartedMeeting] = useState<
    boolean
  >(false);
  const [hasTeacherJoined, setHasTeacherJoined] = useState<boolean>(false);

  const handleContinue = (e: any) => {
    e.preventDefault();
    // perform Action
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
        <PrimaryButton
          disabled={!hasTeacherStartedMeeting}
          label={hasTeacherStartedMeeting ? "Join meet" : "Waiting for teacher"}
          onClick={handleContinue}
          style={BigButtonStyles}
        />
      </Flex>
    </form>
  );
};

export default StudentLobby;
