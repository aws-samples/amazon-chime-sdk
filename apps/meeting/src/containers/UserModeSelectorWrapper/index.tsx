import { Flex } from "amazon-chime-sdk-component-library-react";
import React from "react";
import UserModeSelector from "../../components/SL/UserModeSelector";
import { StyledWrapper } from "../MeetingFormSelector/Styled";
import { StyledDiv } from "../SIPURI/Styled";

const UserModeSelectorWrapper: React.FC = () => {
  return (
    <Flex container layout="fill-space-centered">
      <StyledWrapper>
        <StyledDiv style={{ padding: "3rem 1rem" }}>
          <UserModeSelector />
        </StyledDiv>
      </StyledWrapper>
    </Flex>
  );
};

export default UserModeSelectorWrapper;
