chromeShark.factory("ChromeShark.PlayerInfoFactory", ["ChromeShark.Enums.InterfaceType", function(InterfaceType) {
    return (function() {
        var PlayerInfoFactory = function() {};

        PlayerInfoFactory.GetPlayerInfo = function(chromeSharkInterface) {
            var playerInfo = null;

            //Determines if the interface the Chromeshark is going to put in full screen is from Grooveshark or Spotify
            if (chromeSharkInterface == InterfaceType.enum.Grooveshark) {
                playerInfo = {
                    GetSong: function() {
                        return $("#now-playing-metadata .song");
                    },
                    GetArtist: function() {
                        return $("#now-playing-metadata .artist");
                    },
                    GetTimeElapsed: function() {
                        return $("#now-playing #time-elapsed");
                    },
                    GetTimeTotal: function() {
                        return $("#now-playing #time-total");
                    },
                    GetPlayButton: function() {
                        return $("#play-pause").get(0);
                    },
                    GetPreviousButton: function() {
                        return $("#play-prev").get(0);
                    },
                    GetNextButton: function() {
                        return $("#play-next").get(0);
                    },
                };
            } else if (chromeSharkInterface == InterfaceType.enum.Spotify) {
                //Spotify player info
                playerInfo = {
                    GetSong: function() {
                        return $("iframe#app-player").contents().find("#track-name");
                    },
                    GetArtist: function() {
                        return $("iframe#app-player").contents().find("#track-artist");
                    },
                    GetTimeElapsed: function() {
                        return $("iframe#app-player").contents().find("#track-current");
                    },
                    GetTimeTotal: function() {
                        return $("iframe#app-player").contents().find("#track-length");
                    },
                    GetPlayButton: function() {
                        return $("iframe#app-player").contents().find("#play-pause").get(0);
                    },
                    GetPreviousButton: function() {
                        return $("iframe#app-player").contents().find("#previous").get(0);
                    },
                    GetNextButton: function() {
                        return $("iframe#app-player").contents().find("#next").get(0);
                    },
                };
            };
            return playerInfo;
        }
        return PlayerInfoFactory;
    })();
}]);
