import { Flex } from "amazon-chime-sdk-component-library-react";
import React from "react";
import UserModeSelector from "../../components/SL/UserModeSelector";
import { LOCAL_STORAGE_ITEM_KEYS } from "../../utils/enums";
import { GetFromLocalStorage } from "../../utils/helpers/localStorageHelper";
import { StyledWrapper } from "../MeetingFormSelector/Styled";
import { StyledDiv } from "../SIPURI/Styled";

const UserModeSelectorWrapper: React.FC = () => {

  const localMeetingId = GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.LOCAL_MEETING_ID) || "";
  
  return (
    <Flex container layout="fill-space-centered">
      <StyledWrapper>
        <StyledDiv style={{ padding: "3rem 1rem" }}>
          <UserModeSelector meetingId={localMeetingId!!} />
        </StyledDiv>
      </StyledWrapper>
    </Flex>
  );
};

export default UserModeSelectorWrapper;
