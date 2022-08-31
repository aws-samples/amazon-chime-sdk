import { Chat, NavbarItem } from 'amazon-chime-sdk-component-library-react'
import React from 'react'
import { useNavigation } from '../../providers/NavigationProvider'
import slPluginWrapper from '../SLPluginWrapper'

const IframePlugin: React.FC<any> = ({someFunction} : {someFunction: () => {}}) => {

    const {toggleChat, toggleRoster} = useNavigation();

    const initIframePlugin = () => {
        someFunction();
        toggleChat();
        toggleRoster();
        
    };

  return (
    <NavbarItem
        icon={<Chat />}
        onClick={() => initIframePlugin()}
        label="Iframe Plugin"
    />
  )
}

export default slPluginWrapper(IframePlugin)