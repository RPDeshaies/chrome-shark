chromeShark.controller("ChromeShark.HelpController", ["$scope", "ChromeShark.ViewStateFactory", function($scope, ViewState){
  $scope.viewState = ViewState;

  $scope.quickLinks = [
    {
      title : "Website",
      href : "http://tareck117.github.io/chrome-shark/",
      iconClass : "fa-info-circle",
    },
    {
      title : "Trello/Roadmap",
      href : "https://trello.com/b/BVeXyRMd/chrome-shark-chrome-extension",
      iconClass : "fa-trello",
    },
    {
      title : "Github",
      href : "https://github.com/Tareck117/chrome-shark/",
      iconClass : "fa-github",
    },
    {
      title : "Extension",
      href : "https://chrome.google.com/webstore/detail/chrome-shark/fifmpfkhpojgoodihbmflkgpifanigbd",
      iconClass : "fa-google",
    },
    {
      title : "Report an issue",
      href : "https://github.com/Tareck117/chrome-shark/issues",
      iconClass : "fa-exclamation-circle",
    },
    {
      title : "Rate the application",
      href : "https://chrome.google.com/webstore/detail/chrome-shark/fifmpfkhpojgoodihbmflkgpifanigbd/reviews",
      iconClass : "fa-star",
    },
  ];
}]);
