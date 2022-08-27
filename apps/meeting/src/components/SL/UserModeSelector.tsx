import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import Spinner from "../../components/icons/Spinner";
import { useAppState } from "../../providers/AppStateProvider";
import { BigButtonStyles } from "../../styles/customStyles";

const UserModeSelector: React.FC = ({}) => {
  const [isLoading] = useState(false);
  const { meetingId } = useAppState();

  const joinAsStudentHandler = (e: any) => {
    e.preventDefault();
    // Perform actions
  };

  const joinAsTeacherHandler = (e: any) => {
    e.preventDefault();
    // perform actions
  };

  return (
    <form>
      <Heading tag="h1" level={4} css="margin-bottom: 1rem; text-align: center">
        SplashLiv
      </Heading>
      <Heading tag="h6" level={6} css="margin-bottom: 1rem; text-align: center">
        {`Meeting Id: ${meetingId}`}
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
            label="Join as Teacher"
            onClick={joinAsTeacherHandler}
            style={BigButtonStyles}
          />
        )}
      </Flex>
      <Flex
        container
        layout="fill-space-centered"
        style={{ marginTop: "2.5rem" }}
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <PrimaryButton
            label="Join as Student"
            onClick={joinAsStudentHandler}
            style={BigButtonStyles}
          />
        )}
      </Flex>
    </form>
  );
};

export default UserModeSelector;
