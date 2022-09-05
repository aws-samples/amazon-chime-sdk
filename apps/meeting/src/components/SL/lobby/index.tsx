import React from "react";
import {
  StyledDiv,
  StyledWrapper,
} from "../../../containers/MeetingFormSelector/Styled";
import { useAppState } from "../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../utils/enums";
import { StyledLayout } from "../../../views/DeviceSetup/Styled";
import StudentLobby from "./StudentLobby";
import TeacherLobby from "./TeacherLobby";

const Lobby = () => {
  
  const { joineeType } = useAppState();

  const screenToRender =
    joineeType === USER_TYPES.STUDENT ? (
      <StudentLobby
      />
    ) : (
      <TeacherLobby
      />
    );

  return (<>
    <StyledLayout>
      <StyledWrapper>
        <StyledDiv>{screenToRender}</StyledDiv>
      </StyledWrapper>
    </StyledLayout>
    </>
  );
};

export default Lobby;
