* Changes:
    * Added PluginProvider, this will serve to current and upcoming plugins to send and recieve custom actions.
    * Added pluginManager that contains enums and interfaces for plugins.
    * Added IframePlugin, added logics for students and teachers.
    * Added event handling for IframePlugin.
    * Made a common PluginRenderer which can be used to switch the layout for different plugins accordingly.
    * Skipped the device selection screen.
    * Started and Joined meeting from MeetingForm only as we need roster updates on Lobby screens.
    * Made CustomVideoTileGrid to be able to manipulate the UI.