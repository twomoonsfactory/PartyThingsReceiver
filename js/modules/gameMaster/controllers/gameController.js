angular.module('gameMaster')
	.controller('gameController', ['$scope', '$log', function($scope, $log) {
	     
	      	$scope.gamename = null;
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;
  	}]);
