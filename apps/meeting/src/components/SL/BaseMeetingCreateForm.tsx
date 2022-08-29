import {
  Flex,
  FormField,
  Heading,
  Input,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React, { ChangeEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import routes from "../../constants/routes";
import { StyledDiv } from "../../containers/MeetingFormSelector/Styled";
import { BigButtonStyles } from "../../styles/customStyles";
import { LOCAL_STORAGE_ITEM_KEYS } from "../../utils/enums";
import { SetToLocalStorage } from "../../utils/helpers/localStorageHelper";
import { StyledLayout } from "../../views/DeviceSetup/Styled";
import { StyledWrapper } from "../DeviceSelection/Styled";

// Can be changed later
const MEETING_ID_ERROR_TEXT = "Please enter a valid meeting id";
const MEETING_ID_LENGTH = 4;

const BaseMeetingCreateForm = () => {
    const history = useHistory();
    const [localMeetingId, setLocalMeetingId] = useState("");
    const [meetingIdError, setMeetingIdError] = useState<boolean>(false);


    const validateMeetingId = (): boolean => {
      // can setup custom logic later
      if(localMeetingId.length >= MEETING_ID_LENGTH) return true;
      return false;
    }

  const handleContinue = (e: any) => {
    e.preventDefault();

    if(!validateMeetingId()){
      setMeetingIdError(true);
      return;
    }
    
    SetToLocalStorage(LOCAL_STORAGE_ITEM_KEYS.LOCAL_MEETING_ID, localMeetingId);
    history.push(`${routes.USER_SELECT}`);
  };

  return (
    <StyledLayout>
      <StyledWrapper>
        <StyledDiv>
          <form>
            <Heading tag="h1" level={4} css="text-align: center">
              SplashLiv
            </Heading>
            <Heading
              tag="h6"
              level={6}
              css="margin-bottom: 3rem; text-align: center"
            >
              Create a meeting
            </Heading>
            <FormField
              field={Input}
              label="Meeting Id"
              value={localMeetingId}
              infoText="Anyone with access to the meeting ID can join"
              errorText={MEETING_ID_ERROR_TEXT}
              fieldProps={{
                name: "meetingId",
                placeholder: "Enter Meeting Id",
              }}
              error={meetingIdError}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                setLocalMeetingId(e.target.value);
                setMeetingIdError(false);
              }}
            />
            <Flex
              container
              layout="fill-space-centered"
              style={{ marginTop: "2.5rem" }}
            >
              <PrimaryButton label="Continue" onClick={handleContinue} style={BigButtonStyles} />
            </Flex>
          </form>
        </StyledDiv>
      </StyledWrapper>
    </StyledLayout>
  );
};

export default BaseMeetingCreateForm;
