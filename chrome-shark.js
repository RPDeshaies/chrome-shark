/*
Snippet to include as the anchor `href` :

//test
javascript: (function() {
  var protocol = window.location.protocol === 'file:' ? 'http:' : '';
  var url = protocol + '//www.sprymedia.co.uk/VisualEvent/VisualEvent_Loader.js';
  if (typeof VisualEvent != 'undefined') {
    if (VisualEvent.instance !== null) {
    VisualEvent.close();
    } else {
    new VisualEvent();
    }
  } else {
    var n = document.createElement('script');
    n.setAttribute('language', 'JavaScript');
    n.setAttribute('src', url + '?rand=' + new Date().getTime());
    document.body.appendChild(n);
  }
})();

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
    "defaultAlbumArtUrl": "http://cdn.last.fm/flatness/responsive/2/noimage/default_album_300_g4.png",
    //The API and secret for using the Last.FM API !
    "lastFmApiKey": "ad333b16177f470aa55bd705557d5727",
    "lastFmSecret": "0ec337aaa1272e22a3c9f86c76480461",
  };

  function ChromeShark() {
    var $ = null; //Local jQuery variables

    this.songTitle = "";
    this.artist = "";
    this.artistBio = "";
    this.timeElapsed = "";
    this.timeTotal = "";
    this.$playControls = null;
    this.currentlyLoadingImage = false;
    this.updateMetaDataTimeout = null;
    this.updatePlayerControlsTimeout = null;
    this.playerInfo = undefined;
    this.chromeSharkInterface = undefined;

    /**
    * Initialize the player information from the DOM elements
    * @return {bool} If the player info exists
    */
    function InitializePlayerInfo() {
      if (!this.playerInfo || !this.playerInfo.$song || this.playerInfo.$song.length == 0) {
        //Determines if the interface the Chromeshark is going to put in full screen is from Grooveshark or Spotify
        if (this.chromeSharkInterface == this.Interface.Grooveshark) {
          this.playerInfo = {
            $song: $("#now-playing-metadata .song"),
            $artist: $("#now-playing-metadata .artist"),
            $timeElapsed: $("#now-playing #time-elapsed"),
            $timeTotal: $("#now-playing #time-total"),
            $controls: $("#play-controls"),
          };
        } else {
          this.playerInfo = {
            $song: $("iframe#app-player").contents().find("#track-name"),
            $artist: $("iframe#app-player").contents().find("#track-artist"),
            $timeElapsed: $("iframe#app-player").contents().find("#track-current"),
            $timeTotal: $("iframe#app-player").contents().find("#track-length"),
            $controls: $("iframe#app-player").contents().find("#controls"),
          };
        }
      }

      return this.playerInfo.$song && this.playerInfo.$song.length != 0;
    }
    // ------------------------------------------------------------------------
    //Priviliged methods
    // ------------------------------------------------------------------------

    /**
    * Create, if not already created, the UI and show it
    */
    this.Show = function() {
      var thisRef = this;

      if (this.IsUICreated()) {
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
          "background": "linear-gradient(#111119 0%, #0C3A5F 100%)",
          "z-index": "99999999999",
          "float": "left",
        });

        //The album art to load from the songs meta data
        var $albumArt = $("<img class='chrome-shark-album-art'>").css({
          "width": "100%",
          "height": "100%",
        });

        thisRef.albumArtUrl = properties.defaultAlbumArtUrl
        $albumArt.attr("src", properties.defaultAlbumArtUrl);

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
          "overflow-y": "scroll",
        });
        var $metaDataHeader = $("<span>Now playing | <a class='chrome-shark-close-button'>Close</a></span>").css({
          "color": "#EBEBEB",
          "float": "right",
          "padding-top": "10px",
          "font-size": "12pt",
          "font-weight": "normal",
        });

        //Close Chrome-Shark if the user press on the `esc` key
        $(document).keyup(function(e) {
          if (e.keyCode === 27) {
            if (thisRef.IsUIVisible()) {
              thisRef.Close();
            } else {
              chromeShark.Show();
            }
          }
        });

        //Close Chrome-Shark if the user click on the `anchor`
        $metaDataHeader.find(".chrome-shark-close-button").click(function(e) {
          e.preventDefault();
          thisRef.Close();
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
        }).append($metaDataHeader)
        //Append the ChromeShark logo
        .append("<span class='logo-chrome-shark'>" +
        "<span class='logo-chrome'>Chrome</span>" +
        "<span class='logo-shark'>Shark</span>" +
        "</span>");

        //Contains all the metadata of the songs
        $metaDataContainer.append("<div class='chrome-shark-track-info'>" + "    <span>" + "        <span class='chrome-shark-title'></span>" + "        <div class='chrome-shark-artist-container'>" + "            <span class='chrome-shark-artist-prefix'>by </span><span class='chrome-shark-artist'></span>" + "        </div>" + "    </span>" + "</div>" + "<div class='chrome-shark-track-controls'> " + "    <span class='chrome-shark-time-elapsed-total' style='color:white'>" + "        <span class='chrome-shark-time-elapsed'></span> / <span class='chrome-shark-time-total'></span>" + "    </span>" + "    <div class='chrome-shark-progress-bar-container'>" + "     <div class='chrome-shark-progress-bar'>" + "       <div class='chrome-shark-progress-bar-current-progress'>" + "       </div>" + "     </div>" + "    </div>" + "</div>" + "<div class='chrome-shark-artist-bio' style='display:none'>" + " <span class='chrome-shark-artist-summary-title'>Artist summary </span>" + " <p class='chrome-shark-artist-bio-summary'></p>" + "</div>" + "<div class='chrome-shark-track-no-info'>" + " <span>No songs are currently playing." + " </br>Close Chrome-Shark and add some !" + " </span>" + "</div>");

        $gsToolbar.find(".logo-chrome").css({
          "font-family": "'Righteous', cursive",
          "font-style": "normal",
          "color": "#d85117",
          "font-size": "20pt",
        });

        $gsToolbar.find(".logo-shark").css({
          "font-family": "'Righteous', cursive",
          "font-style": "normal",
          "color": "#adadad",
          "font-size": "20pt",
        });

        //Style all the meta-data informations
        $metaDataContainer.find(".chrome-shark-title").css({
          "font-size": "20pt",
          "line-height": "30px",
        });

        $metaDataContainer.find(".chrome-shark-artist-container").css({
          "font-weight": "lighter",
          "font-size": "15pt",
          "margin-top": "15px",
        });

        $metaDataContainer.find(".chrome-shark-artist-summary-title").css({
          "font-size": "20pt",
          "line-height": "30px",
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
          "min-height": "100px",
        });
        //We set the title's style
        $metaDataContainer.find(".chrome-shark-track-controls .chrome-shark-time-elapsed-total").css({
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
          "margin": "10px 0px 10px 0px",
        });
        $metaDataContainer.find(".chrome-shark-progress-bar-current-progress").css({
          "position": "absolute",
          "top": "0",
          "left": "0",
          "width": "0px",
          "background-color": "#007ACC",
          "height": "8px",
          "border-radius": "4px",
        });
        UpdatePlayerControls.call(this, $metaDataContainer);
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
      UpdateMetaData.call(this);
      this.Flip(true);
    };
    // ------------------------------------------------------------------------
    //Private methods
    // ------------------------------------------------------------------------
    /**
    * Update the controls that manage the Play/Pause/Next/Previous actions from the one on the Grooveshark website
    * @param {$} $metaDataContainer The current meta container, default will be the one on the page
    */
    function UpdatePlayerControls($metaDataContainer) {
      var thisRef = this;
      if (this.chromeSharkInterface == this.Interface.Grooveshark) {
        $metaDataContainer = $metaDataContainer || $(".chrome-shark-meta-data-container");
        if ($metaDataContainer) {
          //We clone the controls to keep the layout but not the events since it's causing performance problems
          thisRef.$playControls = thisRef.playerInfo.$controls.clone().removeAttr("id").addClass("chrome-shark-track-controls-button").css({
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-bottom": "100px",
            "width": "90px",
          });
          //We manually trigger the events when a controls is clicked
          thisRef.$playControls.find("a").click(function() {
            var $this = $(this);
            //Since the Chrome-Shark app is declared after the real controls, we get them simply using their original ID.
            var $realControl = $("#" + $this.attr("id"));
            //Trigger the click event
            $realControl.click();
          });
          //Since there could be a delay before the next sync, we want to trigger the play-pause
          //  playing class to keep the Chrome-Shark ... kind of synchronized
          thisRef.$playControls.find("#play-pause").click(function() {
            $(this).toggleClass("playing")
          });
          $(".chrome-shark-track-controls-button").remove();
          $metaDataContainer.find(".chrome-shark-progress-bar-container").before(this.$playControls);
        }
        clearTimeout(thisRef.updatePlayerControlsTimeout);
        thisRef.updatePlayerControlsTimeout = setTimeout(function() {
          UpdatePlayerControls.call(thisRef);
        }, properties.updateTimePlayerControls);
      }
    }
    /**
    * Get the currently song's meta data and compare them to the last one retrieved.
    * If they are different, we simply update them and also update the UI
    *
    * Also get the track and artist information from Last.fm
    */
    function UpdateMetaData() {
      var thisRef = this;

      //Just to be sure that the
      var playerExists = InitializePlayerInfo.call(thisRef);

      if (playerExists) {
        var newSongTitle = thisRef.playerInfo.$song.text();
        var newArtist = thisRef.playerInfo.$artist.text();
        var newTimeElapsed = thisRef.playerInfo.$timeElapsed.text().trim() || "0:00";
        var newTimeTotal = thisRef.playerInfo.$timeTotal.text().trim() || "0:00";

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
            GetLastFmData.call(thisRef);
          }
          //If there's an new album art to show we clone the current one, wait for the new image to load and fade it in.
          if ($(".chrome-shark-album-art") && $(".chrome-shark-album-art").attr("src") != this.albumArtUrl && !this.currentlyLoadingImage) {
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
      }

      clearTimeout(this.updateMetaDataTimeout);
      this.updateMetaDataTimeout = setTimeout(function() {
        UpdateMetaData.call(thisRef);
      }, properties.updateTimeMetaData);
    }

    function GetLastFmData() {
      var thisRef = this;

      //Get the track information (mostly the album art)
      $.ajax("https://ws.audioscrobbler.com/2.0/?method=track.getInfo&" + "api_key=" + properties.lastFmApiKey + "&artist=" + encodeURI(thisRef.artist) + "&track=" + encodeURI(thisRef.songTitle) + "&format=json", {
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

          //Get the artist information
          $.ajax("https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=" + properties.lastFmApiKey + "&artist=" + encodeURI(thisRef.artist) + "&format=json", {
            success: function(data) {
              if (data && data.artist) {
                if(data.artist.image){
                  var artist = data.artist;
                  var largestArtistImageUrl = artist.image[artist.image.length - 1]["#text"];

                  //Since there is no image for this album, we use the artist image if it exists
                  if(thisRef.albumArtUrl == properties.defaultAlbumArtUrl && largestArtistImageUrl){
                    thisRef.albumArtUrl = largestArtistImageUrl;
                  }
                }

                if(artist.bio.summary){
                  $(".chrome-shark-artist-bio-summary").html(artist.bio.summary);
                  thisRef.artistBio = artist.bio.summary;
                  $(".chrome-shark-artist-bio-summary").find("a").css({
                    "color": "#4A4A4A",
                  });
                  $(".chrome-shark-artist-bio").show();
                }
                else {
                  $(".chrome-shark-artist-bio-summary").empty();
                  $(".chrome-shark-artist-bio").hide();
                  thisRef.artistBio = "";
                }//end else
              }//end if
            }//end success
          });//end ajax
        }//end success
      });//end ajax
    }//end GetLastFmData()

    /**
    * Flip the meta data and the album art of side to not burn pixels on TV
    * @param  {bool} p_setupTimer If we need to setup a timer to repeat the flip at some intervals
    * @return {undefined}
    */
    this.Flip = function(p_setupTimer) {
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
        thisRef.Flip();
      }, properties.flipTime);
    };
    /**
    * If the UI exists in the DOM
    * @return {undefined}
    */
    this.IsUICreated = function() {
      var $chromeSharkUi = $(".chrome-shark");
      return $chromeSharkUi && $chromeSharkUi.length > 0;
    };
    /**
    * If the UI is currently visible for the user or if it's closed
    * @return {undefined}
    */
    this.IsUIVisible = function() {
      var $chromeSharkUI = $(".chrome-shark");
      return $chromeSharkUI && $chromeSharkUI.is(":visible");
    };
    /**
    * Hide the Chrome-Shark window and clear all the timers to not update the data if the app is hidden
    * @return {undefined}
    */
    this.Close = function() {
      clearTimeout(this.updateMetaDataTimeout);
      clearTimeout(this.flipTimeout);
      $(".chrome-shark").hide();
    };

    this.DetectInterfaceType = function() {
      this.chromeSharkInterface = this.Interface.Grooveshark
      if (location.host.indexOf("grooveshark") == -1) {
        this.chromeSharkInterface = this.Interface.Spotify;
      }
    }

    this.GetDependencies = function(callback) {
      //Download jQuery if it is not already defined
      if (!window.jQuery) {
        var js = document.createElement('script');
        js.src = "";
        ChromeShark.prototype.GetScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js", function() {
          //Now jQuery Exists
          jQuery.noConflict();
          //Initializing local jQuery Variable
          $ = jQuery;
          callback();
        })
      } else {
        $ = jQuery;
        callback();
      }
    }

    //Constructor
    function __constructor() {
      var thisRef = this;

      this.GetDependencies(function() {
        thisRef.DetectInterfaceType();
        InitializePlayerInfo.call(thisRef);
        UpdateMetaData.call(thisRef);
        thisRef.Show();
      })
    }
    __constructor.call(this);
  }

  // ------------------------------------------------------------------------
  // Public methods
  // ------------------------------------------------------------------------

  /**
  * Add a script to download inside of the head of the page and call a method when the script is loaded
  * @url : The url of the script to download
  * @callback : The method to call when the script is loaded
  */
  ChromeShark.prototype.GetScript = function(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    // most browsers
    script.onload = callback;
    // IE 6 & 7
    script.onreadystatechange = function() {
      if (this.readyState == 'complete') {
        callback();
      }
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  ChromeShark.prototype.Interface = {
    Grooveshark: 0,
    Spotify: 1,
  };

  return ChromeShark;
})();

if (typeof ChromeShark != 'undefined') {
  if (window.chromeShark) {
    window.chromeShark.Close();
  } else {
    window.chromeShark = new ChromeShark();
  }
} else {
  var url = location.protocol + "//tareck117.github.io/chrome-shark/js/app/chrome-shark.min.js";
  var script = document.createElement('script');

  script.setAttribute('language', 'JavaScript');
  script.setAttribute('src', url + '?rand=' + new Date().getTime());
  document.body.appendChild(script);
}
