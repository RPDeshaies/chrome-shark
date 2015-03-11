//https://developer.chrome.com/extensions/tut_analytics

chromeShark.controller("ChromeShark.MainController", ["$scope", "$timeout", "ChromeShark.ViewStateFactory", "ChromeShark.AlbumArtFactory", function($scope, $timeout, ViewState, AlbumArt){
    var properties = {
      //The interval to flip the UI horizontally
      // flipTime: 1000 * 60 * 5, //5 min
      flipTime : 1000,
    };

    $scope.viewState = ViewState;
    $scope.albumArt = AlbumArt;
    $scope.$scopeDom = $("#chrome-shark-scope");
    $scope.albumArtPosition = "left";
    $scope.contentPosition = "right";

    $scope.PlayerButtonClicked = function() {
      $scope.viewState.current = "player";
    }

    $scope.HelpButtonClicked = function() {
      $scope.viewState.current = "help";
    }

    $scope.CloseButtonClicked = function() {
      $scope.$scopeDom.hide();
    }

    var FlipLayout = function(){

      if($scope.albumArtPosition == "left"){
        $scope.albumArtPosition = "right";
        $scope.contentPosition = "left";
      }
      else{
        $scope.albumArtPosition = "left";
        $scope.contentPosition = "right";
      }

      $timeout(FlipLayout, properties.flipTime);
    }

    var Init = function(){
      FlipLayout();
    }

    Init();
  } //end controller
]);
