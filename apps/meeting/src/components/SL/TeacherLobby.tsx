import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { BigButtonStyles } from "../../styles/customStyles";

const DUMMY_WAITING_STUDENTS_COUNT = 5;

const TeacherLobby = () => {
  const { meetingId } = useAppState();

  const handleContinue = (e: any) => {
    e.preventDefault();
    // perform Action
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
        <PrimaryButton label="Start meeting" onClick={handleContinue} style={BigButtonStyles} />
      </Flex>
    </form>
  );
};

export default TeacherLobby;
