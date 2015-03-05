var chromeShark = angular.module("chromeShark", []);

/**
 * AngularHelper : Contains methods that help using angular without being in the scope of an angular controller or directive
 */
var AngularHelper = (function () {
    var AngularHelper = function () { };

    /**
     * ApplicationName : Default application name for the helper
     */
    var defaultApplicationName = "chromeShark";

    /**
		 * Compile : Compile html with the rootScope of an application
		 *  and replace the content of a target element with the compiled html
		 * @$targetDom : The dom in which the compiled html should be placed
		 * @htmlToCompile : The html to compile using angular
		 * @applicationName : (Optionnal) The name of the application (use the default one if empty)
		 */
    AngularHelper.Compile = function ($targetDom, htmlToCompile, applicationName) {
        var $injector = angular.injector(["ng", applicationName || defaultApplicationName]);

        $injector.invoke(["$compile", "$rootScope", function ($compile, $rootScope) {
						//Get the scope of the target, use the rootScope if it does not exists
            var $scope = $targetDom.html(htmlToCompile).scope();
            $compile($targetDom)($scope || $rootScope);
            $rootScope.$digest();
        }]);
    }

    return AngularHelper;
})();

var Main = (function(){
	var Main = function(){};

	Main.Init = function(){
		var $targetDom = $("#chrome-shark-scope");

		if($targetDom.length > 0){
			//If the dom is already create it, we toggle its visibility
			$targetDom.toggle();
		}
		else{
			//Get the Chrome Shark base template
			$.ajax(chrome.extension.getURL("app/views/chrome-shark.html"), {
				success : function(view){
					//Append the template
					$("body").append("<div id='chrome-shark-scope'>");
					var $targetDom = $("#chrome-shark-scope");

					//Compile it to bind it with angular
					AngularHelper.Compile($targetDom, view)
				}
			});
		}
	}
	return Main;
})();
