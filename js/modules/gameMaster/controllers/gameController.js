angular.module('gameMaster')
	.controller('gameController', ['$scope', '$log', function($scope, $log) {
	     	$scope.message = "Foo";
	      	$scope.gamename = "Foo";
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;
  	}]);
