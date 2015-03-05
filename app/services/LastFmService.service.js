chromeShark.service("LastFmService", ["$http","$q",function($http,$q){
	return (function(){
		//The API and secret for using the Last.FM API !
		var lastFmApiKey = "ad333b16177f470aa55bd705557d5727";
		var lastFmSecret = "0ec337aaa1272e22a3c9f86c76480461";

		var LastFmService = function(){};

		LastFmService.GetTrackInfo = function(trackName, artistName){
			var deferred = $q.defer();

			$http.get("https://ws.audioscrobbler.com/2.0/?method=track.getInfo&"
				+ "api_key=" + lastFmApiKey
				+ "&artist=" + encodeURI(artistName)
				+ "&track=" + encodeURI(trackName)
				+ "&format=json").success(function(data){
					deferred.resolve(data.track);
				});

			return deferred.promise;
		}

		LastFmService.GetArtistInfo = function(trackName, artistName){
			var deferred = $q.defer();

			$http.get("https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&"
				+ "api_key=" + lastFmApiKey
				+ "&artist=" + encodeURI(artistName)
				+ "&track=" + encodeURI(trackName)
				+ "&format=json").success(function(data){
					deferred.resolve(data.artist);
				});

			return deferred.promise;
		}
		return LastFmService;
	})();
}]);
