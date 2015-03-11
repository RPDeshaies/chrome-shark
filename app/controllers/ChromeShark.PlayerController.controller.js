chromeShark.controller("ChromeShark.PlayerController", ["$scope", "$timeout", "$sce", "ChromeShark.PlayerInfoFactory", "ChromeShark.Enums.InterfaceType",
  "LastFmService", "ChromeShark.ViewStateFactory", "ChromeShark.AlbumArtFactory", function($scope, $timeout, $sce, PlayerInfoFactory, InterfaceType, LastFmService, ViewState, AlbumArt) {

    $scope.viewState = ViewState;

    var properties = {
      //The interval to refresh the meta data
      updateTimeMetaData: 200, //200ms
    };

    //The album art to load if Last.fm don't find one
    // var defaultAlbumArtUrl = "http://cdn.last.fm/flatness/responsive/2/noimage/default_album_300_g4.png";
    var defaultAlbumArtUrl = "http://lorempixel.com/500/500/abstract/";
    var chromeSharkInterface = InterfaceType.GetInterfaceType();
    var playerInfo = PlayerInfoFactory.GetPlayerInfo(chromeSharkInterface);

    $scope.$scopeDom = $("#chrome-shark-scope");
    $scope.trackName = "";
    $scope.trackArtist = "";
    $scope.timeStart = "";
    $scope.timeEnd = "";
    $scope.artistSummary = "";
    $scope.albumArt = AlbumArt;
    $scope.albumArt.src = defaultAlbumArtUrl;
    $scope.percentageElapsed = 32;
    $scope.viewState.current = "player";

    //Public
    $scope.PlayPauseButtonClicked = function() {
      playerInfo.GetPlayButton().click();
    }

    $scope.PreviousButtonClicked = function() {
      playerInfo.GetPreviousButton().click();
    }

    $scope.NextButtonClicked = function() {
      playerInfo.GetNextButton().click();
    }

    //Private
    var RefreshMetaData = function() {
      if (playerInfo) {
        //Get the new value from the DOM
        var newTrackName = playerInfo.GetSong().text();
        var newTrackArtist = playerInfo.GetArtist().text();
        var newTimeStart = playerInfo.GetTimeElapsed().text().trim() || "0:00";
        var newTimeEnd = playerInfo.GetTimeTotal().text().trim() || "0:00";

        //Parse the new start and end time and calculate the completed percentage
        var timeRegex = new RegExp("[0-9]+", "g");
        var minutesElapsed = parseInt(newTimeStart.match(timeRegex)[0]);
        var secondsElapsed = parseInt(newTimeStart.match(timeRegex)[1]);
        var minutesTotal = parseInt(newTimeEnd.match(timeRegex)[0]);
        var secondsTotal = parseInt(newTimeEnd.match(timeRegex)[1]);

        $scope.percentageElapsed = ((minutesElapsed * 60) + secondsElapsed) / ((minutesTotal * 60) + secondsTotal) * 100;
        $scope.timeStart = newTimeStart;
        $scope.timeEnd = newTimeEnd;

        if (newTrackName != $scope.trackName) {
          $scope.trackName = newTrackName;
          $scope.trackArtist = newTrackArtist;

          //Get track and artist info from last fm
          LastFmService.GetTrackInfo($scope.trackName, $scope.trackArtist).then(function(track) {
            //If there is an album art
            if (track && track.album && track.album.image && track.album.image.length > 0) {
              $scope.albumArt.src = "";
              $scope.albumArt.src = GetImageFromImageData(track.album.image, defaultAlbumArtUrl);
            } else {
              //Use the default album art
              $scope.albumArt.src = "";
              $scope.albumArt.src = defaultAlbumArtUrl;
            }


            LastFmService.GetArtistInfo($scope.trackName, $scope.trackArtist).then(function(artist) {
              if (artist && artist.bio && artist.bio.summary) {
                $scope.artistSummary = $sce.trustAsHtml(artist.bio.summary)
              } else {
                $scope.artistSummary = "";
              }

              //If no image were found using the track info
              if (!$scope.albumArt.src || $scope.albumArt.src == defaultAlbumArtUrl) {
                //If there is an image for that artist
                if (artist && artist.image && artist.image.length > 0) {
                  $scope.albumArt.src = "";
                  $scope.albumArt.src = GetImageFromImageData(artist.image, defaultAlbumArtUrl);
                }
              }
            });
          });
        }

        $timeout(RefreshMetaData, properties.updateTimeMetaData);
      } else {
        playerInfo = GetPlayerInfo(chromeSharkInterface);
        $timeout(RefreshMetaData, properties.updateTimeMetaData * 3);
      }
    }

    var GetImageFromImageData = function(images, defaultImage) {
      var image = defaultImage;
      var biggestImage = images[images.length - 1]["#text"];

      if (biggestImage.indexOf("noimage") == -1) {
        image = biggestImage;
      }
      return image;
    }


    var Init = function() {
      RefreshMetaData();
    }

    Init();
  } //end controller
]);
