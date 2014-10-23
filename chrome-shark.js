/*
  Snippet to include as the anchor `href` :
  javascript:(function(){
    if (typeof chromeShark !== "undefined" && !chromeShark.isUIVisible()) {
      chromeShark.show();
    }
    else if(typeof chromeShark !== "undefined" && chromeShark.isUIVisible()){
      chromeShark.close();
    }
    else{
      document.body.appendChild(document.createElement('script')).src='http://tareck117.github.io/chrome-shark/js/app/chrome-shark.min.js';
    }
  })();

  //Minified
  javascript:(function(){if(typeof chromeShark!=="undefined"&&!chromeShark.isUIVisible()){chromeShark.show()}else if(typeof chromeShark!=="undefined"&&chromeShark.isUIVisible()){chromeShark.close()}else{document.body.appendChild(document.createElement("script")).src="http://tareck117.github.io/chrome-shark/js/app/chrome-shark.min.js"}})()
*/


/**
 * Generate a full screen UI for Grooveshark that auto updates and get meta datas from the Last.fm API
 */
var ChromeShark = (function() {
  var properties = {
    //The interval to refresh the meta data
    "updateTimeMetaData": 200, //200ms
    //The interval between refresh of the player controls
    "updateTimePlayerControls": 3000, //3 sec
    //The interval to flip the UI horizontally
    "flipTime": 1000 * 60 * 5, //5 min
    //The album art to load if Last.fm don't find one
    "defaultAlbumArtUrl": "http://tareck117.github.io/chrome-shark/img/app/no-artwork.png",
    //The API and secret for using the Last.FM API !
    "lastFmApiKey": "ad333b16177f470aa55bd705557d5727",
    "lastFmSecret": "0ec337aaa1272e22a3c9f86c76480461",
  };

  function ChromeShark() {
    this.songTitle = "";
    this.artist = "";
    this.timeElapsed = "";
    this.timeTotal = "";
    this.$playControls = null;
    this.currentlyLoadingImage = false;
    this.updateMetaDataTimeout = null;
    this.updatePlayerControlsTimeout = null;

    //Priviliged methods

    /**
     * Create, if not already created, the UI and show it
     */
    this.show = function() {
      var thisRef = this;

      if (this.isUICreated()) {
        $(".chrome-shark").show();
      } else {
        var $chromeShark = $("<div class='chrome-shark'>").css({
          "display": "block",
          "position": "fixed",
          "width": "100%",
          "height": "100%",
          "left": "0",
          "top": "0",
          "z-index": "99999999999"
        });

        //Container containing only the album art
        var $albumArtContainer = $("<div class=chrome-shark-album-art-container>").css({
          "display": "block",
          "width": "55%",
          "height": "100%",
          "background-color": "#C0C0C0",
          "z-index": "99999999999",
          "float": "left",
        });

        //The album art to load from the songs meta data
        var $albumArt = $("<img class='chrome-shark-album-art'>").css({
          "width": "100%",
          "height": "100%",
        });
        $albumArtContainer.append($albumArt);

        //The other half of the screen ! Contains the header, the meta data and the controls of the player
        var $metaDataContainer = $("<div class='chrome-shark-meta-data-container'>").css({
          "padding": "20px",
          "background-color": "#FFF",
          "margin": "80px 50px 20px 50px",
          "display": "block",
          "position": "absolute",
          "height": "auto",
          "bottom": "0",
          "top": "0",
          "left": "0",
          "right": "0",
          "border-radius": "10px",
          "min-width": "400px",
          "min-height": "270px",
        });

        var $metaDataHeader = $("<h2>Now playing | <a class='chrome-shark-close-button'>Close</a></h2>").css({
          "color": "#EBEBEB",
          "float": "right",
          "padding-top": "2px",
          "font-weight": "normal",
        });

        //Close Chrome-Shark if the user press on the `esc` key
        $(document).keyup(function(e) {
          if (e.keyCode === 27) {
            if(thisRef.isUIVisible()){
              thisRef.close();
            }
            else{
              chromeShark.show();
            }
          }
        });

        //Close Chrome-Shark if the user click on the `anchor`
        $metaDataHeader.find(".chrome-shark-close-button").click(function(e) {
          e.preventDefault();
          thisRef.close();
        });

        var $gsToolbar = $("<div class='chrome-shark-gs-toolbar'>").css({
            "transform": "translateZ(0)",
            "padding": "12px",
            "-ms-transition": ".3s",
            "background-image": "linear-gradient(top, #333, #222)",
            "filter": "progid:DXImageTransform.Microsoft.Gradient(startColorstr='#ff333333', endColorstr='#ff222222', GradientType=0)",
            "-webkit-transform": "translateZ(0)",
            "-moz-transform": "translateZ(0)",
            "-ms-transform": "translateZ(0)",
            "min-width": "400px",
            "text-align": "left",
          })
          .append($metaDataHeader)

        //Append the Grooveshark logo
        .append('<img src="data:image/png;base64,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">');

        //Contains all the metadata of the songs
        $metaDataContainer.append(
          "<div class='chrome-shark-track-info'>" +
          "    <h2>" +
          "        <span class='chrome-shark-title'></span>" +
          "        <div class='chrome-shark-artist-container'>" +
          "            <span class='chrome-shark-artist-prefix'>by </span><span class='chrome-shark-artist'></span>" +
          "        </div>" +
          "    </h2>" +
          "</div>" +
          "<div class='chrome-shark-track-controls'> " +
          "    <h3 style='color:white'>" +
          "        <span class='chrome-shark-time-elapsed'></span> / <span class='chrome-shark-time-total'></span>" +
          "    </h3>" +
          "    <div class='chrome-shark-progress-bar-container'>" +
          "     <div class='chrome-shark-progress-bar'>" +
          "       <div class='chrome-shark-progress-bar-current-progress'>" +
          "       </div>" +
          "     </div>" +
          "    </div>" +
          "</div>" +
          "<div class='chrome-shark-artist-bio' style='display:none'>" +
          " <h2>Artist summary </h2>" +
          " <p class='chrome-shark-artist-bio-summary'></p>" +
          "</div>" +
          "<div class='chrome-shark-track-no-info'>" +
          " <h1>No songs are currently playing." +
          " </br>Close Chrome-Shark and add some !" +
          " </h1>" +
          "</div>"
        );

        //Style all the meta-data informations
        $metaDataContainer.find(".chrome-shark-title").css({
          "font-size": "20pt",
          "line-height": "30px",
        });

        $metaDataContainer.find(".chrome-shark-artist-container").css({
          "font-weight": "lighter",
          "margin-top": "15px",
        });

        $metaDataContainer.find(".chrome-shark-track-controls").css({
          "margin-top": "10%",
          "position": "relative",
          "width": "100%",
          "background-color": "#181818",
          "padding": "15px",
          "box-sizing": "border-box",
          "ms-box-sizing": "border-box",
          "webkit-box-sizing": "border-box",
          "moz-box-sizing": "border-box",
          "border-radius": "7px",
          "color": "white",
          "margin-bottom": "40px",
        });

        //We set the title's style
        $metaDataContainer.find(".chrome-shark-track-controls h3").css({
          "color": "#FFF",
          "font-size": "26px",
          "text-align": "center",
          "margin-top": "10px",
        });

        //We set the progress bar's style
        $metaDataContainer.find(".chrome-shark-progress-bar").css({
          "background-color": "#4E4E4E",
          "height": "8px",
          "width": "100%",
          "border-radius": "4px",
          "position": "relative",
        });

        $metaDataContainer.find(".chrome-shark-progress-bar-current-progress").css({
          "position": "absolute",
          "top": "0",
          "left": "0",
          "width": "0px",
          "background-color": "#f88800",
          "height": "8px",
          "border-radius": "4px",
        });

        updatePlayerControls.call(this, $metaDataContainer);

        $metaDataContainer.find(".chrome-shark-artist-bio-summary").css({
          "font-size": "12pt",
          "line-height": "20pt",
          "font-weight": "bold",
        });

        var $metaData = $("<div class=chrome-shark-meta-data>").css({
          "display": "block",
          "width": "45%",
          "height": "100%",
          "z-index": "99999999999",
          "float": "right",
          "position": "relative",
          "font-family": "sans-serif",
          "text-align": "center",
          "background": "linear-gradient(#111119 0%, #0C3A5F 100%)",
          "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#000c1f', endColorstr='#00203a',GradientType=0 )",

        }).append($gsToolbar).append($metaDataContainer);

        $chromeShark.append($albumArtContainer).append($metaData);

        $("body").after($chromeShark);
      }

      updateMetaData.call(this);
      this.flip(true);
    };

    //Private methods

    /**
     * Update the controls that manage the Play/Pause/Next/Previous actions from the one on the Grooveshark website
     * @param {$} $metaDataContainer The current meta container, default will be the one on the page
     */
    function updatePlayerControls($metaDataContainer) {
      $metaDataContainer = $metaDataContainer || $(".chrome-shark-meta-data-container");
      if ($metaDataContainer) {
        //We clone the controls to keep the layout but not the events since it's causing performance problems
        this.$playControls = $("#play-controls").clone().removeAttr("id").addClass("chrome-shark-track-controls-button").css({
          "margin-left": "auto",
          "margin-right": "auto",
          "margin-bottom": "100px",
          "width": "90px",
        });

        //We manually trigger the events when a controls is clicked
        this.$playControls.find("a").click(function() {
          var $this = $(this);

          //Since the Chrome-Shark app is declared after the real controls, we get them simply using their original ID.
          var $realControl = $("#" + $this.attr("id"));
          //Trigger the click event
          $realControl.click();
        });

        //Since there could be a delay before the next sync, we want to trigger the play-pause
        //  playing class to keep the Chrome-Shark ... kind of synchronized
        this.$playControls.find("#play-pause").click(function() {
          $(this).toggleClass("playing")
        });

        $(".chrome-shark-track-controls-button").remove();
        $metaDataContainer.find(".chrome-shark-progress-bar-container").before(this.$playControls);
      }

      clearTimeout(this.updatePlayerControlsTimeout);

      this.updatePlayerControlsTimeout = setTimeout(function() {
        updatePlayerControls.call(this);
      }, properties.updateTimePlayerControls);
    }

    /**
     * Get the currently song's meta data and compare them to the last one retrieved.
     * If they are different, we simply update them and also update the UI
     *
     * Also get the track and artist information from Last.fm
     */
    function updateMetaData() {
      var thisRef = this;

      var newSongTitle = $("#now-playing-metadata .song").text();
      var newArtist = $("#now-playing-metadata .artist").text();
      var newTimeElapsed = $("#now-playing #time-elapsed").text();
      var newTimeTotal = $("#now-playing #time-total").text();

      if (!newSongTitle || !newArtist) {
        //There no track in the current playlist, we show the "no information" DOM to notifiy the user
        $(".chrome-shark-track-info").hide();
        $(".chrome-shark-track-no-info").show();
        $(".chrome-shark-track-controls").hide();
      } else {
        //We update the UI
        $(".chrome-shark-track-info").show();
        $(".chrome-shark-track-no-info").hide();
        $(".chrome-shark-track-controls").show();

        if ($(".chrome-shark-title").text() != newSongTitle) {
          $(".chrome-shark-title").text(this.songTitle);
        }
        if ($(".chrome-shark-artist").text() != newArtist) {
          $(".chrome-shark-artist").text(this.artist);
        }
        if ($(".chrome-shark-time-elapsed").text() != newTimeElapsed) {
          $(".chrome-shark-time-elapsed").text(this.timeElapsed);
          var percentageElapsed = 0;

          if (this.timeElapsed && this.timeTotal) {
            var timeRegex = new RegExp("[0-9]+", "g");

            var minutesElapsed = parseInt(newTimeElapsed.match(timeRegex)[0]);
            var secondsElapsed = parseInt(newTimeElapsed.match(timeRegex)[1]);
            var minutesTotal = parseInt(newTimeTotal.match(timeRegex)[0]);
            var secondsTotal = parseInt(newTimeTotal.match(timeRegex)[1]);

            percentageElapsed = ((minutesElapsed * 60) + secondsElapsed) / ((minutesTotal * 60) + secondsTotal) * 100;

          }

          var $progressBar = $(".chrome-shark-progress-bar-current-progress");

          if ($progressBar) {
            $progressBar.css({
              "width": percentageElapsed + "%",
            });
          }
        }

        if ($(".chrome-shark-time-total").text() != newTimeTotal) {
          $(".chrome-shark-time-total").text(this.timeTotal);
        }

        var titleChanged = false;
        if (newSongTitle != this.songTitle) {
          this.songTitle = newSongTitle;

          titleChanged = true;
        }

        if (newArtist != this.artist) {
          this.artist = newArtist;
        }

        //If the song switched
        if (titleChanged) {
          //Get the track information (mostly the album art)
          $.ajax("http://ws.audioscrobbler.com/2.0/?" +
            "method=track.getInfo&" +
            "api_key=" + properties.lastFmApiKey + "&" +
            "artist=" + encodeURI(this.artist) + "&" +
            "track=" + encodeURI(this.songTitle) + "&" +
            "format=json", {
              success: function(data) {
                var track = data.track;
                var albumArtUrl = properties.defaultAlbumArtUrl;
                if (track && track.album) {
                  var lastFmAlbumArtUrl = track.album.image[track.album.image.length - 1]["#text"];
                  if (lastFmAlbumArtUrl.indexOf("noimage") == -1) {

                    var imageFormatRegex = new RegExp("serve/.+/", "g");
                    albumArtUrl = lastFmAlbumArtUrl.replace(imageFormatRegex, "serve/_/");
                  }
                }

                thisRef.albumArtUrl = albumArtUrl;
              }
            });

          //Get the artist information
          $.ajax("http://ws.audioscrobbler.com/2.0/?" +
            "method=artist.getInfo&" +
            "api_key=" + properties.lastFmApiKey + "&" +
            "artist=" + encodeURI(this.artist) + "&" +
            "format=json", {
              success: function(data) {
                var artist = data.artist;

                if (artist && artist.bio.summary) {
                  $(".chrome-shark-artist-bio-summary").html(artist.bio.summary);
                  $(".chrome-shark-artist-bio").fadeIn();
                } else {
                  $(".chrome-shark-artist-bio-summary").empty();
                  $(".chrome-shark-artist-bio").hide();
                }
              }
            });
        }

        //If there's an new album art to show we clone the current one, wait for the new image to load and fade it in.
        if ($(".chrome-shark-album-art") &&
          $(".chrome-shark-album-art").attr("src") != this.albumArtUrl && !this.currentlyLoadingImage) {
          this.currentlyLoadingImage = true;

          var $newAlbumArt = $(".chrome-shark-album-art").clone();
          $newAlbumArt.attr("src", this.albumArtUrl).hide();

          //Fadind in smoothly the new image
          $newAlbumArt.load(function() {
            thisRef.currentlyLoadingImage = false;
            $(".chrome-shark-album-art").after($newAlbumArt).remove();

            //We fade in the album art that replaced the old one
            $(".chrome-shark-album-art").stop(true, true).show();
          });
        }

        //Refresh the songs times
        if (newTimeTotal != this.timeTotal) {
          this.timeTotal = newTimeTotal;
        }

        if (newTimeElapsed != this.timeElapsed) {
          this.timeElapsed = newTimeElapsed;
        }
      }

      clearTimeout(this.updateMetaDataTimeout);

      this.updateMetaDataTimeout = setTimeout(function() {
        updateMetaData.call(thisRef);
      }, properties.updateTimeMetaData);
    }

    //Constructor
    function __constructor() {
      updateMetaData.call(this);
    }

    __constructor.call(this);
  }

  //Public methods

  /**
   * Flip the meta data and the album art of side to not burn pixels on TV
   * @param  {bool} p_setupTimer If we need to setup a timer to repeat the flip at some intervals
   * @return {undefined}
   */
  ChromeShark.prototype.flip = function(p_setupTimer) {
    if (!p_setupTimer) {
      var metaDataFloat = $(".chrome-shark-meta-data").css("float");
      var newMetaDataFloat = "";
      if (metaDataFloat == "left") {
        newMetaDataFloat = "right";
      } else {
        newMetaDataFloat = "left";
      }

      $(".chrome-shark-meta-data").css("float", newMetaDataFloat);
      $(".chrome-shark-album-art-container").css("float", metaDataFloat);
    }

    var thisRef = this;

    clearTimeout(this.flipTimeout);
    this.flipTimeout = setTimeout(function() {
      thisRef.flip();
    }, properties.flipTime);
  };

  /**
   * If the UI exists in the DOM
   * @return {undefined}
   */
  ChromeShark.prototype.isUICreated = function() {
    return $(".chrome-shark").length > 0;
  };

  /**
   * If the UI is currently visible for the user or if it's closed
   * @return {undefined}
   */
  ChromeShark.prototype.isUIVisible = function() {
    return $(".chrome-shark").is(":visible");
  };

  /**
   * Hide the Chrome-Shark window and clear all the timers to not update the data if the app is hidden
   * @return {undefined}
   */
  ChromeShark.prototype.close = function() {
    clearTimeout(this.updateMetaDataTimeout);
    clearTimeout(this.flipTimeout);
    $(".chrome-shark").hide();
  };

  return ChromeShark;
})();

var chromeShark;

if (chromeShark && chromeShark.isUIVisible()) {
  chromeShark.close();
} else {
  //Release
  chromeShark = chromeShark || new ChromeShark();
  chromeShark.show();
}