module.exports = angular.module('gameMaster')
	.controller('playerController', ['$scope', function($scope){
		var incoming = {playerName: "Incoming Player", score: 0};
      	$scope.players = [
      		{
      			playerName: "Joe",
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
      	//adds "pending player"
      	$scope.pendPlayer = function(){
      		$scope.players.push(incoming);
      	}
      	//adds a new player to the display
      	$scope.addPlayer = function(player){
      		$scope.players.splice(_.indexOf($scope.players, incoming), 1);
      		$scope.players.push(player);
      	};
      	//drops a player from the display
      	$scope.dropPlayer = function(player){
      		$scope.players.splice(_.indexOf($scope.players, player), 1);
      	};
      	//highlight a player with pending action

      	//remove highlight

      	//sort players by score
	}]);