var Background = (function(){
  var supportedSites = ["spotify", "soundcloud"];

  var Background = function(){};

  Background.IsSupportedSite = function(url){
    var isSupportedSite = false;

    for(var i = 0; i != supportedSites.length; ++i){
      var supportedSite = supportedSites[i];

      if(url.indexOf(supportedSite) != -1){
        isSupportedSite = true;
        break;
      }
    }

    return isSupportedSite;
  }

  return Background;
})();

//Bind default chrome events
chrome.tabs.onUpdated.addListener(function(tabId, data, tab){
    if(Background.IsSupportedSite(tab.url)){
      chrome.pageAction.show(tabId);
    }
});

chrome.pageAction.onClicked.addListener(function(tab){
  chrome.tabs.executeScript(tab.id, {
  	code : "Main.Init();",
  });
});
