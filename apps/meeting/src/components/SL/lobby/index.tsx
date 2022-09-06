// This component basically renders the lobby type according to the current joineeType.

import { useToggleLocalMute } from "amazon-chime-sdk-component-library-react";
import React, { useEffect } from "react";
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
  const { toggleMute } = useToggleLocalMute();

  const screenToRender =
    joineeType === USER_TYPES.STUDENT ? (
      <StudentLobby
      />
    ) : (
      <TeacherLobby
      />
    );

    useEffect(() => {
      // muting the audio by default
      toggleMute();
    }, [])

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
