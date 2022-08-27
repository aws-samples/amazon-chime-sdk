import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Spinner from "../../components/icons/Spinner";
import { BigButtonStyles } from "../../styles/customStyles";
import { USER_TYPES } from "../../utils/enums";

interface UserModeSelectorProps {
  meetingId: string
}

const UserModeSelector: React.FC<UserModeSelectorProps> = ({meetingId}) => {
  const [isLoading] = useState(false);
  const history = useHistory();

  const joinAsStudentHandler = (e: any) => {
    e.preventDefault();
    // Perform actions
    history.push(`/meeting/${meetingId}?usertype=${USER_TYPES.STUDENT}`);
  };

  const joinAsTeacherHandler = (e: any) => {
    e.preventDefault();
    // perform actions
    history.push(`/meeting/${meetingId}?usertype=${USER_TYPES.TEACHER}`);
  };

  const joinAsAdminHandler = (e: any) => {
    e.preventDefault();
    // perform actions
    history.push(`/meeting/${meetingId}?usertype=${USER_TYPES.ADMIN}`);
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
            label="Join as Admin"
            onClick={joinAsAdminHandler}
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
