* Changes
    * Made a custom api caller using axios.
    * Replaced existing fetch api calls with custom api caller.
    * Added Teacher/Student lobby events and synchronization.
    * Tweaked localStorage helper methods to follow expiry time.
    * Took PluginProvider to upper level to make it available for lobby screens.

* Bug fix
    * Fixed the bug where attendee names were coming blank upon reloading meeting page.
    * Fixed clearing of localStorage info upon meeting end.
