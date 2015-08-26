chromeShark.factory("ChromeShark.Enums.InterfaceType", [function() {

  var InterfaceType = function() {};

  InterfaceType.enum = {
    Spotify: 0,
    Soundcloud: 1,
  };

  InterfaceType.GetInterfaceType = function() {
    var interface = InterfaceType.enum.Spotify
    if (location.host.indexOf("spotify") == -1) {
      interface = InterfaceType.enum.Soundcloud;
    }

    return interface;
  }
  return InterfaceType;
}]);
