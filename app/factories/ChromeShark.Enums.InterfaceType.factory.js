chromeShark.factory("ChromeShark.Enums.InterfaceType", [function(){
	return (function(){

		var InterfaceType = function(){};

		InterfaceType.enum = {
	    	Grooveshark: 0,
	    	Spotify: 1,
	  	};

		InterfaceType.GetInterfaceType = function(){
	      var interface = InterfaceType.enum.Grooveshark
	      if (location.host.indexOf("grooveshark") == -1) {
	        interface = InterfaceType.enum.Spotify;
	      }

	      return interface;
	    }
	    return InterfaceType;
	})();
}]);