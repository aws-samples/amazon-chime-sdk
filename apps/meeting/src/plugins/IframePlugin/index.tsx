import { Chat, NavbarItem } from "amazon-chime-sdk-component-library-react";
import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { useNavigation } from "../../providers/NavigationProvider";
import { usePluginState } from "../../providers/PluginProvider";
import { CUSTOM_LAYOUTS, USER_TYPES } from "../../utils/enums";
import { SLPlugin, SLPlugins } from "./pluginManager";

const IframePlugin: React.FC = () => {
  const [isPluginActive, togglePluginActive] = useState<boolean>(false);
  const { closeChat, closeRoster} = useNavigation();
  const { localUserName, joineeType } = useAppState();
  const { setCustomLayout } = useAppState();
  const { sendCustomEvent, recievedIframePluginData } = usePluginState();

  // toggle plugin state. active <=> inactive
  const handlePluginState = () => {
    if (!isPluginActive) {
      closeChat();
      closeRoster();
      togglePluginActive(true);
      setCustomLayout(CUSTOM_LAYOUTS.IFRAME_PLUGIN_LAYOUT);
      const customEventParams = {
        message: SLPlugin.IFrame,
        payload: {
          action: SLPlugins.iframe.startedPlugin,
          startedBy: localUserName,
          userType: joineeType
        }
      };
      sendCustomEvent(customEventParams);
    } else {
      togglePluginActive(false);
      setCustomLayout(CUSTOM_LAYOUTS.DEFAULT_LAYOUT);
      const customEventParams = {
        message: SLPlugin.IFrame,
        payload: {
          action: SLPlugins.iframe.stoppedPlugin,
          startedBy: localUserName,
          userType: joineeType
        }
      };
      sendCustomEvent(customEventParams);
    }
  };

  const handleReceivedEvent = (recievedIframePluginData: any): void => {
    switch(recievedIframePluginData?.payload?.action){
      case SLPlugins.iframe.startedPlugin : {
        closeChat();
        closeRoster();
        togglePluginActive(true);
        setCustomLayout(CUSTOM_LAYOUTS.IFRAME_PLUGIN_LAYOUT);
      } break;

      case SLPlugins.iframe.stoppedPlugin : {
        togglePluginActive(false);
        setCustomLayout(CUSTOM_LAYOUTS.DEFAULT_LAYOUT);
      } break;
    }
  } 

  useEffect(() => {
    // Only students will be able to receive and handle events for now
    if(joineeType === USER_TYPES.STUDENT)
      handleReceivedEvent(recievedIframePluginData);
  }, [recievedIframePluginData]);

  return (
    <>
      {joineeType !== USER_TYPES.STUDENT ? (
        <NavbarItem
          icon={<Chat />}
          onClick={() => handlePluginState()}
          label="Iframe Plugin"
        />
      ) : (
        <NavbarItem
          icon={<Chat />}
          onClick={() => alert("You don't have permission for this.")}
          label="Iframe Plugin"
        />
      )}
    </>
  );
};

export default IframePlugin;
