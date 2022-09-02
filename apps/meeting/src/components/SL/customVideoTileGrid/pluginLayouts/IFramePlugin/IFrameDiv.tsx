import { Heading } from "amazon-chime-sdk-component-library-react";
import React from "react";
import { useAppState } from "../../../../../providers/AppStateProvider";
import { USER_TYPES } from "../../../../../utils/enums";

const IFRAME_TITLE = `SplashLiv`;

interface IFrameDivProps {
  linkToOpen: string;
  toggleIframe: boolean;
}

const IFrameDiv: React.FC<IFrameDivProps> = ({ linkToOpen, toggleIframe }) => {

  const {joineeType} = useAppState();

  const blankComponentStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "2rem",
    width: `${window.innerWidth - 150}px`,
    height: joineeType === USER_TYPES.STUDENT ? `${window.innerHeight - 75}px` : `${window.innerHeight - 200}px`,
    border: "1px solid black",
    backgroundColor: "#F5F5F5"
  };
  
  const pluginActiveStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "2rem",
    width: `${window.innerWidth - 150}px`,
    height: joineeType === USER_TYPES.STUDENT ? `${window.innerHeight - 100}px` : `${window.innerHeight - 200}px`,
    border: "1px solid black"
  }

  const toRender = !toggleIframe ? (
    <div style={blankComponentStyles}>
      <Heading tag="h6" level={6} css="margin-bottom: 1rem;">
        {`IFrame Plugin`}
      </Heading>
    </div>
  ) : (
    <iframe src={linkToOpen} title={IFRAME_TITLE} style={pluginActiveStyles}></iframe>
  );

  return <div>{toRender}</div>;
};

export default IFrameDiv;
