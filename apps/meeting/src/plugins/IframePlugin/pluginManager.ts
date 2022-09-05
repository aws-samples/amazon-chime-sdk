export enum SLPlugin {
    IFrame = 'iframe',
    Lobby = 'lobby'
}

enum IFramePluginActions {
    STARTED_PLUIGN = 'startedPlugin',
    STOPPED_PLUGIN = 'stoppedPlugin',
    OPEN_URL = 'openURL',
    CLOSE_URL = 'closeURL',
}

enum LobbyPluginActions {
    TEACHER_JOINED_LOBBY = 'teacherJoinedLobby',
    TEACHER_STARTED_MEETING = 'teacherStartedMeeting'
}

export interface ISLPlugins{
    [SLPlugin.IFrame] : {
        startedPlugin: string;
        stoppedPlugin: string;
        openURL: string;
        closeURL: string;
    };
    [SLPlugin.Lobby] : {
        teacherJoinedLobby: string;
        teacherStartedMeeting: string;
    };
}

export const SLPlugins: ISLPlugins = {
    [SLPlugin.IFrame] : {
        startedPlugin: IFramePluginActions.STARTED_PLUIGN,
        stoppedPlugin: IFramePluginActions.STOPPED_PLUGIN,
        openURL: IFramePluginActions.OPEN_URL,
        closeURL: IFramePluginActions.CLOSE_URL
    },
    [SLPlugin.Lobby] : {
        teacherJoinedLobby: LobbyPluginActions.TEACHER_JOINED_LOBBY,
        teacherStartedMeeting: LobbyPluginActions.TEACHER_STARTED_MEETING
    }
}