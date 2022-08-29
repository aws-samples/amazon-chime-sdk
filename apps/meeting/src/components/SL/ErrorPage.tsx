// This error page will be rendered whenever an unknown route is encountered

import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import routes from "../../constants/routes";
import { StyledDiv } from "../../containers/MeetingFormSelector/Styled";
import { BigButtonStyles } from "../../styles/customStyles";
import { StyledLayout } from "../../views/DeviceSetup/Styled";
import { StyledMediaMetricsWrapper } from "../MediaStatsList/Styled";

const ErrorPage = () => {

  const [currentPageURL, setCurrentPageURL] = useState<string>("");
  const history = useHistory();

  const init = (): void => {
    setCurrentPageURL(window.location.href);
  };

  const goToHomeHandler = () => {
    history.push(routes.BASE_URL);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <StyledLayout>
      <StyledMediaMetricsWrapper>
        <StyledDiv>
          <Heading tag="h1" level={4} css="text-align: center">
            SplashLiv
          </Heading>
          <Heading
            tag="h6"
            level={6}
            css="margin-bottom: 1rem; text-align: center"
          >
            {`URL: ${currentPageURL}`}
          </Heading>
          <Heading
            tag="h6"
            level={6}
            css="margin-bottom: 3rem; text-align: center"
          >
            PAGE NOT FOUND
          </Heading>
          <Flex
            container
            layout="fill-space-centered"
            style={{ marginTop: "2.5rem" }}
          >
            <PrimaryButton
              label="Go to home"
              onClick={goToHomeHandler}
              style={BigButtonStyles}
            />
          </Flex>
        </StyledDiv>
      </StyledMediaMetricsWrapper>
    </StyledLayout>
  );
};

export default ErrorPage;
