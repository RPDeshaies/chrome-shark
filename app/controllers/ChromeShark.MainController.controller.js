//https://developer.chrome.com/extensions/tut_analytics

chromeShark.controller("ChromeShark.MainController", ["$scope", "ChromeShark.ViewStateFactory", "ChromeShark.AlbumArtFactory", function($scope, ViewState, AlbumArt){
    $scope.viewState = ViewState;
    $scope.albumArt = AlbumArt;
    $scope.$scopeDom = $("#chrome-shark-scope");

    $scope.PlayerButtonClicked = function() {
      $scope.viewState.current = "player";
    }

    $scope.HelpButtonClicked = function() {
      $scope.viewState.current = "help";
    }

    $scope.CloseButtonClicked = function() {
      $scope.$scopeDom.hide();
    }
  } //end controller
]);
