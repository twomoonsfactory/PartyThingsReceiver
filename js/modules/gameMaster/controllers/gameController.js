angular.module('gameMaster')
	.controller('gameController', ['$scope', '$log', '$location', function($scope, $log, $location) {
	     	$scope.changeView = function(view){
	     		$location.path(view);
	     	}
	      	$scope.gamename = "MyGame";
	      	$scope.players = [
	      		{
	      			playerName: "Billy",
	      			senderId: 123,
	      			score: 5,
	      			state: "writing",
	      			playerId: 1,
	      			guessed: false
	      		},
	      		{
	      			playerName: "Bob",
	      			senderId: 135,
	      			score: 10,
	      			state: "ready",
	      			playerId: 2,
	      			guessed: false
	      		},
	      		{
	      			playerName: "Samantha",
	      			senderId: 52412,
	      			score: 33,
	      			state: "writing",
	      			playerId: 3,
	      			guessed: false
	      		}
	      	];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;

  	}]);
