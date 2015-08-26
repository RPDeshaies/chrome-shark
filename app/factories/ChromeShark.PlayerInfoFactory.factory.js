chromeShark.factory("ChromeShark.PlayerInfoFactory", ["ChromeShark.Enums.InterfaceType", function(InterfaceType) {

      var PlayerInfoFactory = function() {};

      PlayerInfoFactory.GetPlayerInfo = function(chromeSharkInterface) {
          var playerInfo = null;

          if (chromeSharkInterface == InterfaceType.enum.Spotify) {
              //Spotify player info
              playerInfo = {
                  GetSong: function() {
                      return $("iframe#app-player").contents().find("#track-name").text().trim();
                  },
                  GetArtist: function() {
                      return $("iframe#app-player").contents().find("#track-artist").text().trim();
                  },
                  GetTimeElapsed: function() {
                      return $("iframe#app-player").contents().find("#track-current").text().trim() || "0:00";
                  },
                  GetTimeTotal: function() {
                      return $("iframe#app-player").contents().find("#track-length").text().trim() || "0:00";
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
          }
          else if(chromeSharkInterface == InterfaceType.enum.Soundcloud){
              //Spotify player info
              playerInfo = {
                  GetSong: function() {
                      return document.title.split("by")[0];
                  },
                  GetArtist: function() {
                      return document.title.split("by")[1];
                  },
                  GetTimeElapsed: function() {
                      return $($(".playbackTimeline__timePassed span")[1]).text().trim() || "0:00";
                  },
                  GetTimeTotal: function() {
                      return $($(".playbackTimeline__duration span")[1]).text().trim() || "0:00";
                  },
                  GetPlayButton: function() {
                      return $(".playControl").get(0) ;
                  },
                  GetPreviousButton: function() {
                      return $(".skipControl__previous").get(0);
                  },
                  GetNextButton: function() {
                      return $(".skipControl__next").get(0);
                  },
              };
          }
          return playerInfo;
      }
      return PlayerInfoFactory;
}]);
