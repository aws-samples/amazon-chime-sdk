export enum SLPlugin {
    IFrame = 'iframe'
}

enum IFramePluginActions {
    STARTED_PLUIGN = 'startedPlugin',
    STOPPED_PLUGIN = 'stoppedPlugin',
    OPEN_URL = 'openURL',
    CLOSE_URL = 'closeURL',
}

export interface ISLPlugins{
    [SLPlugin.IFrame] : {
        startedPlugin: string;
        stoppedPlugin: string;
        openURL: string;
        closeURL: string;
    };
}

export const SLPlugins: ISLPlugins = {
    [SLPlugin.IFrame] : {
        startedPlugin: IFramePluginActions.STARTED_PLUIGN,
        stoppedPlugin: IFramePluginActions.STOPPED_PLUGIN,
        openURL: IFramePluginActions.OPEN_URL,
        closeURL: IFramePluginActions.CLOSE_URL
    }
}