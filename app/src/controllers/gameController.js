module.exports = angular.module('gameMaster')
	.controller('gameController', ['$scope', '$log', '$location', function($scope, $log, $location) {
	     	$scope.message = "Foo";
	      	$scope.gamename = "Foo";
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;
	      	$scope.changeView = function(view){
	      		$location.path(view);
	      	}
  	}]);
