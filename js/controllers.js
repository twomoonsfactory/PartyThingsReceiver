angular.module('gameMaster.controllers', [])
	.controller('gameController', ['$scope', '$log', 'imageProvider', 'messageSender', 'messageReceiver', 'eventService', 'stateManager', 'promptProvider',
		function($scope, $log, imageProvider, messageSender, messageReceiver, eventService, stateManager, promptProvider) {
	     
	      	$scope.banner = 'There is a lot going on behind the scenes.... Look at app.js at github.com/twomoonsfactory.com/PartyThingsReceiver ';
	      	$scope.hulk = imageProvider.getPic('waiting');
	      	$scope.gamename = null;
	      	$scope.players = [];
	      	$scope.things = [];
	      	$scope.infoDisplay = null;
	      	$scope.prompts;
	      	var wrongCount = 0;
	      	var unguessedCount = 0;
	      	var currentPlayer = 0;
	      	var playerMin = 5;
	      	var gameNameRequested = false;
	      	var newplayer = 0;

  	}]);
