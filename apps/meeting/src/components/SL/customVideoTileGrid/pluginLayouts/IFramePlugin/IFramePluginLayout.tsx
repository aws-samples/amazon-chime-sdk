// IFramePluginLayout. This layout is rendered when the teacher dispatches the event
// SLPlugins.IFrame.startedPlugin

import {
  ContentShare,
  Flex,
  FormField,
  Input,
  LocalVideo,
  PrimaryButton,
  RemoteVideos,
  useContentShareState,
  useLocalVideo,
  useRemoteVideoTileState,
} from "amazon-chime-sdk-component-library-react";
import { BaseProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/Base";
import React, { ChangeEvent, useEffect, useState } from "react";
import { StyledDiv } from "../../../../../containers/MeetingFormSelector/Styled";
import { Layout } from "../../../../../types";
import IFrameDiv from "./IFrameDiv";
import { useAppState } from "../../../../../providers/AppStateProvider";
import { usePluginState } from "../../../../../providers/PluginProvider";
import { USER_TYPES } from "../../../../../utils/enums";
import { SLPlugin, SLPlugins } from "../../../../../plugins/IframePlugin/pluginManager";

const fluidStyles = `
    height: 100%;
    width: 100%;
  `;

const staticStyles = `
    display: flex;
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    max-height: 25vh;
    width: 25vw;
    video {
      position: static;
    }
  `;

interface Props extends BaseProps {
  /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout | any;
}

const IFramePluginLayout: React.FC<Props> = ({
  noRemoteVideoView,
  layout = "featured",
}) => {
  const { tiles } = useRemoteVideoTileState();
  const { tileId: contentTileId } = useContentShareState();
  const { isVideoEnabled } = useLocalVideo();
  const remoteSize = tiles.length + (contentTileId ? 1 : 0);
  const gridSize =
    remoteSize > 1 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  const [localURL, setLocalURL] = useState<string>("");
  const [isLinkActive, toggleLinkActive] = useState<boolean>(false);
  const [isCloseButtonVisible, setIsCloseButtonVisible] = useState<boolean>(false);
  const { localUserName, joineeType } = useAppState();
  const { sendCustomEvent, recievedIframePluginData } = usePluginState();

  // TBD: update logic for validating URL.
  const isValidURL = () => {
    // logic can be changed later
    return localURL.length < 5 ? false : true;
  }

  // Opening the URL in our as well as other students instance.
  const openURL = (e?: any): void => {
    e?.preventDefault();

    if(!isValidURL()) {
      alert("Please enter a valid URL.");
      return;
    }
    
    const customEventParams = {
      message: SLPlugin.IFrame,
      payload: {
        action: SLPlugins.iframe.openURL,
        url: localURL,
        startedBy: localUserName,
        userType: joineeType,
      },
    };
    sendCustomEvent(customEventParams);
    setIsCloseButtonVisible(true);
    toggleLinkActive(true);
  }

  // Closing the URL in our as well as other students instance.
  const closeURL = (e?: any): void => {
    e?.preventDefault();
    setLocalURL("");
    const customEventParams = {
      message: SLPlugin.IFrame,
      payload: {
        action: SLPlugins.iframe.closeURL,
        startedBy: localUserName,
        userType: joineeType,
      },
    };
    sendCustomEvent(customEventParams);
    setIsCloseButtonVisible(false);
    toggleLinkActive(false);
  }


  // IFramePluginRecieveEvent handler
  const handleReceivedEvent = (recievedIframePluginData: any) => {
    switch(recievedIframePluginData?.payload?.action){
      case SLPlugins.iframe.openURL: {
        setLocalURL(recievedIframePluginData?.payload?.url);
        toggleLinkActive(true);
      } break;
      case SLPlugins.iframe.closeURL: {
        toggleLinkActive(false);
      } break;
    }
  }

  // UseEffect to fire the event handler as soon as we recieve an event.
  useEffect(() => {
    handleReceivedEvent(recievedIframePluginData);
  }, [recievedIframePluginData]);

  return (
    <>
      {/* URL input and cta will be rendered only for Teacer/Admin users */}
      {joineeType !== USER_TYPES.STUDENT ? (
        <div>
          <ContentShare css="grid-area: ft;" />
          <LocalVideo
            nameplate="Me"
            css={gridSize > 1 ? fluidStyles : staticStyles}
          />
          <StyledDiv style={{ padding: "0.5rem 1rem", maxHeight: "6.25rem" }}>
            <form>
              <Flex container layout="fill-space-centered">
                <FormField
                  field={Input}
                  label="URL"
                  infoText="Enter the url here to be opened in all student sessions"
                  value={localURL}
                  fieldProps={{
                    name: "name",
                    placeholder: "Enter Your Password",
                  }}
                  css="width:80%;"
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                    if(!isLinkActive) setLocalURL(e.target.value);
                  }}
                />
                <PrimaryButton
                  label={"Go!"}
                  style={{
                    marginTop: "-0.5rem",
                    width: "6.25rem",
                    marginLeft: "1rem",
                  }}
                  onClick={openURL}
                />
                {isCloseButtonVisible && (
                  <PrimaryButton
                    label={"Close"}
                    style={{
                      marginTop: "-0.5rem",
                      width: "6.25rem",
                      marginLeft: "1rem",
                    }}
                    onClick={closeURL}
                  />
                )}
              </Flex>
            </form>
          </StyledDiv>
          <IFrameDiv linkToOpen={localURL} toggleIframe={isLinkActive} />
        </div>
      ) : (
        <div>
          <ContentShare css="grid-area: ft;" />
          <RemoteVideos 
            css={staticStyles}
          />
          <LocalVideo
            nameplate="Me"
            css={gridSize > 1 ? fluidStyles : staticStyles}
          />
          <IFrameDiv linkToOpen={localURL} toggleIframe={isLinkActive} />
        </div>
      )}
    </>
  );
};

export default IFramePluginLayout;
