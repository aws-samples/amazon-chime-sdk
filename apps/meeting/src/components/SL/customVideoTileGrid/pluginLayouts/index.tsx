// PluginRenderer. This component is responsible for changing the layout of the Meeting
// as directed by the customLayout state. The `CUSTOM_LAYOUTS.DEFAULT_LAYOUT` is the original
// layout provided by the amazon-chime. 

import React from 'react'
import { useAppState } from '../../../../providers/AppStateProvider'
import { CUSTOM_LAYOUTS } from '../../../../utils/enums';
import DashboardScreen from '../DashboardScreen';
import DefaultLayout from './DefaultLayout';
import IFramePluginLayout from './IFramePlugin/IFramePluginLayout';

const PluginRenderer: React.FC = () => {

  const { customLayout } = useAppState();
  
  const pluginLayoutToRender = () => {
    switch(customLayout) {
      case CUSTOM_LAYOUTS.IFRAME_PLUGIN_LAYOUT:
        return (<IFramePluginLayout noRemoteVideoView={<DashboardScreen />} />);
      case CUSTOM_LAYOUTS.DEFAULT_LAYOUT:
        return (<DefaultLayout noRemoteVideoView={<DashboardScreen />} />)
      default:
        return (<DefaultLayout noRemoteVideoView={<DashboardScreen />} />);
    }
  }

  return (
    <div>{pluginLayoutToRender()}</div>
  )
}

export default PluginRenderer